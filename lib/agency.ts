import { connectToDatabase } from "@/lib/db";
import { getAcceptedRenterPartnerIdsForAgency, getAgencyPartnershipData } from "@/lib/partnerships";
import { ensureTripCodeForTrip } from "@/lib/trip-code";
import { getProfileCompleteness } from "@/lib/trust";
import { serializeDocument } from "@/lib/utils";
import AgencyProfile from "@/models/AgencyProfile";
import AgencyReservation from "@/models/AgencyReservation";
import AgencyTrip from "@/models/AgencyTrip";
import Conversation from "@/models/Conversation";
import Lead from "@/models/Lead";
import RentalItem from "@/models/RentalItem";
import RentalRequest from "@/models/RentalRequest";
import Review from "@/models/Review";

type AgencyDirectoryFilters = {
  q?: string;
  city?: string;
};

export async function getAgencyProfileById(agencyId: string) {
  await connectToDatabase();

  const profile = await AgencyProfile.findById(agencyId)
    .populate("user", "name email avatar role sellerVerificationStatus verified")
    .lean();

  if (!profile) {
    return null;
  }

  const [trips, reservations] = await Promise.all([
    AgencyTrip.find({ agency: agencyId, status: "active" }).select("seatsTotal seatsBooked").lean(),
    AgencyReservation.countDocuments({ agency: agencyId })
  ]);

  const serializedProfile = serializeDocument(profile) as any;

  return {
    ...serializedProfile,
    stats: {
      tripsCount: trips.length,
      reservationsCount: reservations,
      openSeats: trips.reduce(
        (sum: number, trip: any) => sum + Math.max(Number(trip.seatsTotal || 0) - Number(trip.seatsBooked || 0), 0),
        0
      )
    },
    profileCompleteness: getProfileCompleteness(serializedProfile)
  };
}

export async function getAgencyProfileByUserId(userId: string) {
  await connectToDatabase();

  const profile = await AgencyProfile.findOne({ user: userId })
    .populate("user", "name email avatar role sellerVerificationStatus verified")
    .lean();
  return profile ? serializeDocument(profile) : null;
}

export async function getAgencyProfiles(filters: AgencyDirectoryFilters = {}) {
  await connectToDatabase();

  const q = typeof filters.q === "string" ? filters.q.trim() : "";
  const city = typeof filters.city === "string" ? filters.city.trim() : "";
  const query: Record<string, unknown> = {};

  if (city) {
    query.city = { $regex: city, $options: "i" };
  }

  if (q) {
    query.$or = [
      { name: { $regex: q, $options: "i" } },
      { city: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } }
    ];
  }

  const profiles = await AgencyProfile.find(query)
    .populate("user", "name email avatar role sellerVerificationStatus verified")
    .sort({ createdAt: -1 })
    .lean();

  const serializedProfiles = serializeDocument(profiles) as any[];

  const agencyIds = serializedProfiles.map((profile) => profile._id);
  const trips = await AgencyTrip.find({
    agency: { $in: agencyIds },
    status: "active"
  })
    .select("agency seatsTotal seatsBooked")
    .lean();

  const tripSummaryByAgency = trips.reduce(
    (summary: Record<string, { tripsCount: number; openSeats: number }>, trip: any) => {
      const agencyId = String(trip.agency);

      if (!summary[agencyId]) {
        summary[agencyId] = { tripsCount: 0, openSeats: 0 };
      }

      summary[agencyId].tripsCount += 1;
      summary[agencyId].openSeats += Math.max(Number(trip.seatsTotal || 0) - Number(trip.seatsBooked || 0), 0);
      return summary;
    },
    {}
  );

  return serializedProfiles.map((profile) => ({
    ...profile,
    stats: tripSummaryByAgency[String(profile._id)] || { tripsCount: 0, openSeats: 0 },
    profileCompleteness: getProfileCompleteness(profile)
  }));
}

export async function getAgencyTrips(agencyId: string) {
  await connectToDatabase();

  const [agency, trips] = await Promise.all([
    AgencyProfile.findById(agencyId)
      .populate("linkedRenterPartners", "name city description logo whatsapp verificationStatus")
      .lean(),
    AgencyTrip.find({ agency: agencyId, status: "active" })
      .populate("renterPartners", "name city description logo whatsapp verificationStatus")
      .sort({ startDate: 1, createdAt: -1 })
      .lean()
  ]);

  const serializedTrips = serializeDocument(trips) as any[];
  const serializedAgency = agency ? (serializeDocument(agency) as any) : null;
  const acceptedPartnerIds = new Set(await getAcceptedRenterPartnerIdsForAgency(agencyId));
  const globalPartners = Array.isArray(serializedAgency?.linkedRenterPartners)
    ? serializedAgency.linkedRenterPartners.filter((partner: any) => acceptedPartnerIds.has(String(partner._id)))
    : [];
  const globalTrustedIds = new Set(
    Array.isArray(serializedAgency?.trustedRenterPartners) ? serializedAgency.trustedRenterPartners.map(String) : []
  );
  const globalRecommendedIds = new Set(
    Array.isArray(serializedAgency?.recommendedRenterPartners)
      ? serializedAgency.recommendedRenterPartners.map(String)
      : []
  );
  const renterIds = Array.from(
    new Set(
      [
        ...globalPartners.map((partner: any) => String(partner._id)),
        ...serializedTrips.flatMap((trip) =>
          Array.isArray(trip.renterPartners)
            ? trip.renterPartners
                .filter((partner: any) => acceptedPartnerIds.has(String(partner._id)))
                .map((partner: any) => String(partner._id))
            : []
        )
      ]
    )
  );
  const items = renterIds.length
    ? await RentalItem.find({
        renter: { $in: renterIds },
        status: "active",
        availabilityStatus: { $ne: "unavailable" },
        quantityAvailable: { $gt: 0 }
      })
        .sort({ createdAt: -1 })
        .select(
          "renter title category location city region price images itemType quantityAvailable pickupInfo deliveryInfo isTrustedPartner isRecommended"
        )
        .lean()
    : [];
  const serializedItems = serializeDocument(items) as any[];
  const itemsByRenter = serializedItems.reduce((summary: Record<string, any[]>, item: any) => {
    const renterId = String(item.renter);
    summary[renterId] = [...(summary[renterId] || []), item];
    return summary;
  }, {});

  return serializedTrips.map((trip) => {
    const { tripCode: _tripCode, ...publicTrip } = trip as any;

    return {
      ...publicTrip,
      renterPartners: Array.from(
        new Map(
          [
            ...globalPartners,
            ...(Array.isArray(trip.renterPartners)
              ? trip.renterPartners.filter((partner: any) => acceptedPartnerIds.has(String(partner._id)))
              : [])
          ].map((partner: any) => [
            String(partner._id),
            partner
          ])
        ).values()
      ).map((partner: any) => {
        const partnerId = String(partner._id);
        const tripTrustedIds = new Set(
          Array.isArray(trip.trustedRenterPartners) ? trip.trustedRenterPartners.map(String) : []
        );
        const tripRecommendedIds = new Set(
          Array.isArray(trip.recommendedRenterPartners) ? trip.recommendedRenterPartners.map(String) : []
        );

        return {
          ...partner,
          isTrustedPartner: globalTrustedIds.has(partnerId) || tripTrustedIds.has(partnerId),
          isRecommended: globalRecommendedIds.has(partnerId) || tripRecommendedIds.has(partnerId),
          recommendedItems: (itemsByRenter[partnerId] || []).slice(0, 6)
        };
      })
    };
  });
}

export async function getAgencyReservations(agencyId: string) {
  await connectToDatabase();

  const reservations = await AgencyReservation.find({ agency: agencyId })
    .populate("trip", "title destination startDate endDate seatsTotal seatsBooked")
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return serializeDocument(reservations);
}

export async function getAgencyDashboardData(userId: string) {
  await connectToDatabase();

  const profile = await AgencyProfile.findOne({ user: userId })
    .populate("user", "name email avatar role sellerVerificationStatus verified")
    .lean();

  if (!profile) {
    return {
      profile: null,
      trips: [],
      reservations: [],
      leads: [],
      conversations: [],
      partnerships: {
        accepted: [],
        incomingRequests: [],
        outgoingRequests: [],
        directory: []
      },
      reviews: [],
      stats: {
        tripsCount: 0,
        reservationsCount: 0,
        rentalRequestsCount: 0,
        remainingSeats: 0,
        leadsCount: 0,
        messagesCount: 0,
        newLeadsCount: 0,
        contactedLeadsCount: 0,
        newReservationsCount: 0,
        pendingRentalRequestsCount: 0,
        contactedReservationsCount: 0,
        confirmedReservationsCount: 0,
        acceptedRentalRequestsCount: 0
      },
      reviewsSummary: {
        count: 0,
        averageRating: 0
      }
    };
  }

  const partnerships = await getAgencyPartnershipData(String(profile._id));

  const [trips, reservations, leads, conversations, rentalRequests, reviews] = await Promise.all([
    AgencyTrip.find({ agency: profile._id })
      .populate("renterPartners", "name city verificationStatus")
      .sort({ createdAt: -1 })
      .lean(),
    AgencyReservation.find({ agency: profile._id })
      .populate("trip", "title destination startDate endDate seatsTotal seatsBooked tripCode")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean(),
    Lead.find({ sellerId: userId }).sort({ createdAt: -1 }).limit(20).lean(),
    Conversation.find({ participants: userId })
      .populate("listing", "title price")
      .populate("participants", "name email")
      .sort({ lastMessageAt: -1 })
      .limit(20)
      .lean(),
    RentalRequest.find({ agency: profile._id })
      .populate("trip", "title city region")
      .populate("renter", "name city")
      .populate("rentalItem", "title itemType")
      .sort({ createdAt: -1 })
      .limit(30)
      .lean(),
    Review.find({ author: userId })
      .populate("listing", "title")
      .populate("place", "name city")
      .sort({ createdAt: -1 })
      .limit(12)
      .lean()
  ]);

  await Promise.all(
    trips
      .filter((trip: any) => !trip.tripCode)
      .map((trip: any) => ensureTripCodeForTrip(String(trip._id)))
  );

  const refreshedTrips = await AgencyTrip.find({ agency: profile._id })
    .populate("renterPartners", "name city verificationStatus")
    .sort({ createdAt: -1 })
    .lean();

  const normalizedRentalRequests = serializeDocument(rentalRequests);
  const requestsByTrip = normalizedRentalRequests.reduce((summary: Record<string, any[]>, request: any) => {
    const tripId = request.trip?._id ? String(request.trip._id) : "";

    if (!tripId) {
      return summary;
    }

    summary[tripId] = [...(summary[tripId] || []), request];
    return summary;
  }, {});
  const normalizedTrips = serializeDocument(refreshedTrips).map((trip: any) => ({
    ...trip,
    linkedRentalRequests: requestsByTrip[String(trip._id)] || []
  }));
  const normalizedReservations = serializeDocument(reservations);
  const normalizedLeads = serializeDocument(leads);
  const normalizedConversations = serializeDocument(conversations);
  const normalizedReviews = serializeDocument(reviews);
  const now = Date.now();
  const upcomingTrips = normalizedTrips.filter((trip: any) => new Date(trip.startDate).getTime() >= now);
  const lowSeatTrips = normalizedTrips.filter((trip: any) => {
    const remaining = Math.max(Number(trip.seatsTotal || 0) - Number(trip.seatsBooked || 0), 0);
    return remaining > 0 && remaining <= 3;
  });
  const leadsByType = normalizedLeads.reduce(
    (summary: Record<string, number>, lead: any) => {
      const key = typeof lead.type === "string" ? lead.type : "other";
      summary[key] = (summary[key] || 0) + 1;
      return summary;
    },
    { whatsapp: 0, call: 0, chat: 0 }
  );
  const leadsByStatus = normalizedLeads.reduce(
    (summary: Record<string, number>, lead: any) => {
      const key = typeof lead.status === "string" ? lead.status : "new";
      summary[key] = (summary[key] || 0) + 1;
      return summary;
    },
    { new: 0, contacted: 0, closed: 0 }
  );
  const reservationsByStatus = normalizedReservations.reduce(
    (summary: Record<string, number>, reservation: any) => {
      const key = typeof reservation.status === "string" ? reservation.status : "pending";
      summary[key] = (summary[key] || 0) + 1;
      return summary;
    },
    { pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
  );
  const recentLeadCount = normalizedLeads.filter((lead: any) => {
    const createdAt = new Date(lead.createdAt).getTime();
    return Number.isFinite(createdAt) && createdAt >= now - 7 * 24 * 60 * 60 * 1000;
  }).length;
  const recentReservationCount = normalizedReservations.filter((reservation: any) => {
    const createdAt = new Date(reservation.createdAt).getTime();
    return Number.isFinite(createdAt) && createdAt >= now - 7 * 24 * 60 * 60 * 1000;
  }).length;
  const rentalRequestsByStatus = normalizedRentalRequests.reduce(
    (summary: Record<string, number>, rentalRequest: any) => {
      const key = typeof rentalRequest.status === "string" ? rentalRequest.status : "pending";
      summary[key] = (summary[key] || 0) + 1;
      return summary;
    },
    { pending: 0, approved: 0, delivered: 0, returned: 0 }
  );
  const recentRentalRequestCount = normalizedRentalRequests.filter((request: any) => {
    const createdAt = new Date(request.createdAt).getTime();
    return Number.isFinite(createdAt) && createdAt >= now - 7 * 24 * 60 * 60 * 1000;
  }).length;

  return {
    profile: serializeDocument(profile),
    trips: normalizedTrips,
    reservations: normalizedReservations,
    rentalRequests: normalizedRentalRequests,
    reviews: normalizedReviews,
    leads: normalizedLeads,
    conversations: normalizedConversations,
    partnerships,
    stats: {
      tripsCount: normalizedTrips.length,
      reservationsCount: normalizedReservations.length,
      rentalRequestsCount: normalizedRentalRequests.length,
      remainingSeats: normalizedTrips.reduce(
        (sum: number, trip: any) => sum + Math.max(Number(trip.seatsTotal || 0) - Number(trip.seatsBooked || 0), 0),
        0
      ),
      leadsCount: normalizedLeads.length,
      messagesCount: normalizedConversations.length,
      upcomingTripsCount: upcomingTrips.length,
      lowSeatTripsCount: lowSeatTrips.length,
      recentLeadCount,
      recentReservationCount,
      recentRentalRequestCount,
      leadsByType,
      leadsByStatus,
      reservationsByStatus,
      rentalRequestsByStatus,
      newLeadsCount: leadsByStatus.new,
      contactedLeadsCount: leadsByStatus.contacted,
      newReservationsCount: reservationsByStatus.pending,
      pendingRentalRequestsCount: rentalRequestsByStatus.pending,
      contactedReservationsCount: 0,
      confirmedReservationsCount: reservationsByStatus.confirmed,
      acceptedRentalRequestsCount: rentalRequestsByStatus.approved
    },
    reviewsSummary: {
      count: normalizedReviews.length,
      averageRating:
        normalizedReviews.length > 0
          ? Number(
              (
                normalizedReviews.reduce((sum: number, review: any) => sum + Number(review.rating || 0), 0) /
                normalizedReviews.length
              ).toFixed(1)
            )
          : 0
    }
  };
}
