import { connectToDatabase } from "@/lib/db";
import { isValidObjectId } from "@/lib/validation";
import { normalizeTripCode } from "@/lib/trip-code";
import { serializeDocument } from "@/lib/utils";
import AgencyProfile from "@/models/AgencyProfile";
import AgencyReservation from "@/models/AgencyReservation";
import AgencyRenterPartnership from "@/models/AgencyRenterPartnership";
import AgencyTrip from "@/models/AgencyTrip";
import RentalItem from "@/models/RentalItem";

export type TripSpaceReservationStatus = "none" | "pending" | "confirmed" | "completed" | "cancelled";

export type TripSpaceData = {
  trip: any;
  agency: any;
  reservation: any | null;
  acceptedPartnerships: any[];
  rentalItems: any[];
  resolvedTripId: string;
  resolvedFromCode: boolean;
  accessStatus: "none" | "pending" | "confirmed" | "completed" | "cancelled";
};

async function resolveTrip(identifier: string) {
  const normalizedIdentifier = String(identifier || "").trim();

  if (!normalizedIdentifier) {
    return null;
  }

  const tripQuery = isValidObjectId(normalizedIdentifier)
    ? { _id: normalizedIdentifier, status: "active" }
    : { tripCode: normalizeTripCode(normalizedIdentifier), status: "active" };

  const trip = await AgencyTrip.findOne(tripQuery)
    .select(
      "_id agency title destination city description price startDate endDate seatsTotal seatsBooked tripCode images region meetingPoint itinerary status"
    )
    .lean();

  return trip ? (serializeDocument(trip) as any) : null;
}

export async function getTripSpaceData({
  identifier,
  userId
}: {
  identifier: string;
  userId?: string;
}): Promise<TripSpaceData | null> {
  await connectToDatabase();

  const trip = await resolveTrip(identifier);

  if (!trip) {
    return null;
  }

  const reservationQuery = userId
    ? AgencyReservation.findOne({ trip: trip._id, user: userId })
        .select("status trip agency user customerName customerEmail phoneNumber city seats preferredDate unitPrice totalPrice createdAt updatedAt")
        .lean()
    : Promise.resolve(null);

  const [agency, reservation, acceptedPartnerships] = await Promise.all([
    AgencyProfile.findById(trip.agency)
      .select("name city logo coverImage description phone whatsapp rating verificationStatus linkedRenterPartners")
      .lean(),
    reservationQuery,
    AgencyRenterPartnership.find({ agency: trip.agency, status: "accepted" })
      .populate("renter", "name city logo whatsapp verificationStatus")
      .sort({ createdAt: -1 })
      .lean()
  ]);

  const serializedAgency = agency ? (serializeDocument(agency) as any) : null;
  const serializedReservation = reservation ? (serializeDocument(reservation) as any) : null;
  const serializedPartnerships = serializeDocument(acceptedPartnerships) as any[];
  const renterIds = Array.from(
    new Set(
      serializedPartnerships
        .map((partnership: any) => String(partnership.renter?._id || partnership.renter))
        .filter(Boolean)
    )
  );

  const rentalItems = renterIds.length
    ? await RentalItem.find({
        renter: { $in: renterIds },
        status: "active",
        availabilityStatus: { $ne: "unavailable" },
        quantityAvailable: { $gt: 0 }
      })
        .select(
          "renter title category location city region size description price images itemType quantityAvailable pickupInfo deliveryInfo availabilityStatus isTrustedPartner isRecommended"
        )
        .populate("renter", "name city logo whatsapp verificationStatus")
        .sort({ isRecommended: -1, isTrustedPartner: -1, createdAt: -1 })
        .lean()
    : [];

  return {
    trip,
    agency: serializedAgency,
    reservation: serializedReservation,
    acceptedPartnerships: serializedPartnerships,
    rentalItems: serializeDocument(rentalItems) as any[],
    resolvedTripId: String(trip._id),
    resolvedFromCode: !isValidObjectId(String(identifier)),
    accessStatus: (serializedReservation?.status || "none") as TripSpaceReservationStatus
  };
}
