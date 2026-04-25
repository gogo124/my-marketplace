import { connectToDatabase } from "@/lib/db";
import { getAcceptedRenterPartnerIdsForAgency, getRenterPartnershipData } from "@/lib/partnerships";
import { getProfileCompleteness } from "@/lib/trust";
import { serializeDocument } from "@/lib/utils";
import AgencyProfile from "@/models/AgencyProfile";
import AgencyTrip from "@/models/AgencyTrip";
import RentalItem from "@/models/RentalItem";
import RentalRequest from "@/models/RentalRequest";
import RenterProfile from "@/models/RenterProfile";
import Review from "@/models/Review";

export async function getRenterProfileByUserId(userId: string) {
  await connectToDatabase();

  const profile = await RenterProfile.findOne({ user: userId }).populate("user", "name email avatar role").lean();
  return profile ? serializeDocument(profile) : null;
}

export async function getAvailableRenterPartners() {
  await connectToDatabase();

  const profiles = await RenterProfile.find({ verificationStatus: { $in: ["pending", "verified"] } })
    .sort({ createdAt: -1 })
    .lean();

  return serializeDocument(profiles).map((profile: any) => ({
    ...profile,
    profileCompleteness: getProfileCompleteness(profile)
  }));
}

export async function getRentalItemsForRenter(renterId: string) {
  await connectToDatabase();

  const items = await RentalItem.find({ renter: renterId }).sort({ createdAt: -1 }).lean();
  return serializeDocument(items);
}

export async function getPublicRentalItems(filters?: {
  q?: string;
  city?: string;
  availability?: string;
}) {
  await connectToDatabase();

  const andConditions: Record<string, unknown>[] = [{ status: "active" }];
  const normalizedQuery = String(filters?.q || "").trim();
  const normalizedCity = String(filters?.city || "").trim();
  const normalizedAvailability = String(filters?.availability || "").trim();

  if (normalizedQuery) {
    andConditions.push({
      $or: [
        { title: { $regex: normalizedQuery, $options: "i" } },
        { category: { $regex: normalizedQuery, $options: "i" } },
        { description: { $regex: normalizedQuery, $options: "i" } },
        { size: { $regex: normalizedQuery, $options: "i" } }
      ]
    });
  }

  if (normalizedCity) {
    andConditions.push({
      $or: [
        { city: { $regex: normalizedCity, $options: "i" } },
        { location: { $regex: normalizedCity, $options: "i" } }
      ]
    });
  }

  if (normalizedAvailability && ["available", "limited", "unavailable"].includes(normalizedAvailability)) {
    andConditions.push({ availabilityStatus: normalizedAvailability });
  }

  const items = await RentalItem.find(andConditions.length === 1 ? andConditions[0] : { $and: andConditions })
    .populate({
      path: "renter",
      select: "name logo city verificationStatus"
    })
    .sort({ isRecommended: -1, isTrustedPartner: -1, createdAt: -1 })
    .lean();

  return serializeDocument(items);
}

export async function getRentalTripPageData(tripId: string) {
  await connectToDatabase();

  const trip = await AgencyTrip.findOne({ _id: tripId, status: "active" })
    .populate("renterPartners", "name city description logo whatsapp verificationStatus")
    .lean();

  if (!trip) {
    return null;
  }

  const agency = await AgencyProfile.findById(trip.agency)
    .select("name city linkedRenterPartners trustedRenterPartners recommendedRenterPartners")
    .populate("linkedRenterPartners", "name city description logo whatsapp verificationStatus")
    .lean();

  const serializedTrip = serializeDocument(trip) as any;
  const serializedAgency = agency ? (serializeDocument(agency) as any) : null;
  const acceptedPartnerIds = new Set(await getAcceptedRenterPartnerIdsForAgency(String(serializedTrip.agency)));
  const globalPartners = Array.isArray(serializedAgency?.linkedRenterPartners)
    ? serializedAgency.linkedRenterPartners.filter((partner: any) => acceptedPartnerIds.has(String(partner._id)))
    : [];
  const allPartners = Array.from(
    new Map(
      [
        ...globalPartners,
        ...(Array.isArray(serializedTrip.renterPartners)
          ? serializedTrip.renterPartners.filter((partner: any) => acceptedPartnerIds.has(String(partner._id)))
          : [])
      ].map((partner: any) => [
        String(partner._id),
        partner
      ])
    ).values()
  );
  const trustedIds = new Set([
    ...(Array.isArray(serializedAgency?.trustedRenterPartners) ? serializedAgency.trustedRenterPartners.map(String) : []),
    ...(Array.isArray(serializedTrip.trustedRenterPartners) ? serializedTrip.trustedRenterPartners.map(String) : [])
  ]);
  const recommendedIds = new Set([
    ...(Array.isArray(serializedAgency?.recommendedRenterPartners) ? serializedAgency.recommendedRenterPartners.map(String) : []),
    ...(Array.isArray(serializedTrip.recommendedRenterPartners) ? serializedTrip.recommendedRenterPartners.map(String) : [])
  ]);
  const renterIds = allPartners.map((partner: any) => String(partner._id));
  const items = renterIds.length
    ? await RentalItem.find({
        renter: { $in: renterIds },
        status: "active",
        availabilityStatus: { $ne: "unavailable" },
        quantityAvailable: { $gt: 0 }
      })
        .sort({ isRecommended: -1, isTrustedPartner: -1, createdAt: -1 })
        .select(
          "renter title category location city region size description price images itemType quantityAvailable pickupInfo deliveryInfo isTrustedPartner isRecommended availabilityStatus"
        )
        .lean()
    : [];
  const serializedItems = serializeDocument(items) as any[];
  const partnersById = Object.fromEntries(
    allPartners.map((partner: any) => [
      String(partner._id),
      {
        ...partner,
        isTrustedPartner: trustedIds.has(String(partner._id)),
        isRecommended: recommendedIds.has(String(partner._id))
      }
    ])
  );

  const { tripCode: _tripCode, ...publicTrip } = serializedTrip;

  return {
    trip: {
      ...publicTrip,
      agency: serializedAgency ? { _id: String(serializedAgency._id), name: serializedAgency.name, city: serializedAgency.city } : null
    },
    items: serializedItems.map((item: any) => {
      const renter = partnersById[String(item.renter)] || null;

      return {
        ...item,
        renter
      };
    })
  };
}

export async function getRenterDashboardData(userId: string) {
  await connectToDatabase();

  const profile = await RenterProfile.findOne({ user: userId }).populate("user", "name email avatar role").lean();

  if (!profile) {
    return {
      profile: null,
      items: [],
      rentalRequests: [],
      partnerships: {
        accepted: [],
        incomingRequests: [],
        outgoingRequests: [],
        directory: []
      },
      reviews: [],
      stats: {
        itemsCount: 0,
        activeItemsCount: 0,
        packagesCount: 0,
        availableUnits: 0,
        rentalRequestsCount: 0,
        acceptedRentalRequestsCount: 0,
        reviewsCount: 0
      },
      reviewsSummary: {
        count: 0,
        averageRating: 0
      }
    };
  }

  const [items, rentalRequests, partnerships, reviews] = await Promise.all([
    RentalItem.find({ renter: profile._id }).sort({ createdAt: -1 }).lean(),
    RentalRequest.find({ renter: profile._id })
      .populate("trip", "title city region tripCode")
      .populate("agency", "name city")
      .populate("rentalItem", "title itemType")
      .sort({ createdAt: -1 })
      .limit(30)
      .lean(),
    getRenterPartnershipData(String(profile._id)),
    Review.find({ author: userId })
      .populate("listing", "title")
      .populate("place", "name city")
      .sort({ createdAt: -1 })
      .limit(12)
      .lean()
  ]);
  const normalizedItems = serializeDocument(items);
  const normalizedRentalRequests = serializeDocument(rentalRequests);
  const normalizedReviews = serializeDocument(reviews);

  return {
    profile: {
      ...(serializeDocument(profile) as any),
      profileCompleteness: getProfileCompleteness(profile as any)
    },
    items: normalizedItems,
    rentalRequests: normalizedRentalRequests,
    reviews: normalizedReviews,
    partnerships,
    stats: {
      itemsCount: normalizedItems.length,
      activeItemsCount: normalizedItems.filter((item: any) => item.status === "active").length,
      packagesCount: normalizedItems.filter((item: any) => item.itemType === "package").length,
      availableUnits: normalizedItems.reduce((sum: number, item: any) => sum + Number(item.quantityAvailable || 0), 0),
      rentalRequestsCount: normalizedRentalRequests.length,
      acceptedRentalRequestsCount: normalizedRentalRequests.filter((request: any) => request.status === "approved").length,
      reviewsCount: normalizedReviews.length
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
