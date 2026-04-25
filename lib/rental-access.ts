import { isValidObjectId } from "@/lib/validation";
import { connectToDatabase } from "@/lib/db";
import { normalizeTripCode } from "@/lib/trip-code";
import AgencyProfile from "@/models/AgencyProfile";
import AgencyReservation from "@/models/AgencyReservation";
import AgencyTrip from "@/models/AgencyTrip";
import RentalItem from "@/models/RentalItem";
import RenterProfile from "@/models/RenterProfile";
import { getAcceptedRenterPartnerIdsForAgency } from "@/lib/partnerships";

export const RENTAL_ACCESS_COOKIE = "rental_trip_access";
export const RENTAL_ACCESS_COOKIE_MAX_AGE = 30 * 60;

function parseRentalAccessCookie(value: string | null | undefined) {
  return String(value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => isValidObjectId(entry));
}

export function createRentalAccessCookieValue(currentValue: string | null | undefined, tripId: string) {
  const nextValues = [tripId, ...parseRentalAccessCookie(currentValue).filter((entry) => entry !== tripId)];
  return nextValues.slice(0, 12).join(",");
}

export function hasRentalTripAccess(currentValue: string | null | undefined, tripId: string) {
  return parseRentalAccessCookie(currentValue).includes(tripId);
}

export function getRentalAccessCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: RENTAL_ACCESS_COOKIE_MAX_AGE
  };
}

async function findConfirmedReservation(userId: string, tripId: string) {
  return AgencyReservation.findOne({
    user: userId,
    trip: tripId,
    status: "confirmed"
  })
    .select("_id trip agency status")
    .lean();
}

async function getAllowedRenterIdsForTrip(trip: {
  agency: string;
  renterPartners?: unknown[];
}) {
  const [agency, acceptedPartnerIds] = await Promise.all([
    AgencyProfile.findById(trip.agency).select("linkedRenterPartners").lean(),
    getAcceptedRenterPartnerIdsForAgency(String(trip.agency))
  ]);

  if (!agency) {
    return null;
  }

  const acceptedPartnerIdSet = new Set(acceptedPartnerIds);

  return new Set([
    ...(Array.isArray(agency.linkedRenterPartners)
      ? agency.linkedRenterPartners
          .map((id: any) => String(id))
          .filter((id: string) => acceptedPartnerIdSet.has(id))
      : []),
    ...(Array.isArray(trip.renterPartners)
      ? trip.renterPartners.map((id: any) => String(id)).filter((id: string) => acceptedPartnerIdSet.has(id))
      : [])
  ]);
}

export async function resolveAuthorizedRentalTrip({
  userId,
  tripCode,
  tripId,
  cookieValue
}: {
  userId: string;
  tripCode?: string | null;
  tripId?: string | null;
  cookieValue?: string | null;
}) {
  await connectToDatabase();

  if (tripCode) {
    const normalizedTripCode = normalizeTripCode(tripCode);

    if (!normalizedTripCode) {
      return { error: "Trip code is required." } as const;
    }

    const trip = await AgencyTrip.findOne({
      tripCode: normalizedTripCode,
      status: "active"
    })
      .select("_id agency renterPartners tripCode")
      .lean();

    if (!trip) {
      return { error: "Invalid trip code." } as const;
    }

    const reservation = await findConfirmedReservation(userId, String(trip._id));

    if (!reservation) {
      return { error: "You need a confirmed reservation for this trip before accessing rental." } as const;
    }

    return { trip, reservation } as const;
  }

  if (tripId) {
    if (!isValidObjectId(tripId)) {
      return { error: "Trip is invalid." } as const;
    }

    if (!hasRentalTripAccess(cookieValue, tripId)) {
      return { error: "Rental access expired. Enter the trip code again." } as const;
    }

    const trip = await AgencyTrip.findOne({
      _id: tripId,
      status: "active"
    })
      .select("_id agency renterPartners tripCode")
      .lean();

    if (!trip) {
      return { error: "Trip is unavailable." } as const;
    }

    const reservation = await findConfirmedReservation(userId, String(trip._id));

    if (!reservation) {
      return { error: "You need a confirmed reservation for this trip before accessing rental." } as const;
    }

    return { trip, reservation } as const;
  }

  return { error: "Trip access is required." } as const;
}

export async function validateAuthorizedRentalItemAccess({
  trip,
  rentalItemId
}: {
  trip: {
    _id: string;
    agency: string;
    renterPartners?: unknown[];
  };
  rentalItemId: string;
}) {
  const item = await RentalItem.findById(rentalItemId).select("_id renter status availabilityStatus quantityAvailable").lean();

  if (!item) {
    return { error: "Rental item not found." } as const;
  }

  const allowedRenterIds = await getAllowedRenterIdsForTrip(trip);

  if (!allowedRenterIds) {
    return { error: "Agency profile not found." } as const;
  }

  if (!allowedRenterIds.has(String(item.renter))) {
    return { error: "This rental item is not linked to the trip." } as const;
  }

  if (
    item.status !== "active" ||
    item.availabilityStatus === "unavailable" ||
    Number(item.quantityAvailable || 0) < 1
  ) {
    return { error: "Selected item is not currently available." } as const;
  }

  const renter = await RenterProfile.findById(item.renter).select("phone whatsapp").lean();

  if (!renter) {
    return { error: "Renter profile not found." } as const;
  }

  return {
    data: {
      tripId: String(trip._id),
      agencyId: String(trip.agency),
      phone: renter.phone || "",
      whatsapp: renter.whatsapp || "",
      quantityAvailable: Number(item.quantityAvailable || 0),
      renterId: String(item.renter)
    }
  } as const;
}

export async function getAllowedRenterIdsForAuthorizedTrip(trip: {
  agency: string;
  renterPartners?: unknown[];
}) {
  return getAllowedRenterIdsForTrip(trip);
}
