import { randomBytes } from "node:crypto";
import { getAcceptedRenterPartnerIdsForAgency } from "@/lib/partnerships";
import AgencyProfile from "@/models/AgencyProfile";
import AgencyTrip from "@/models/AgencyTrip";
import RentalItem from "@/models/RentalItem";
import RenterProfile from "@/models/RenterProfile";

const MIN_TRIP_CODE_LENGTH = 4;
const MAX_TRIP_CODE_LENGTH = 24;

export function normalizeTripCode(value: unknown) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function createTripCodeCandidate() {
  return randomBytes(4).toString("hex").toUpperCase();
}

export async function generateUniqueTripCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = createTripCodeCandidate();
    const existing = await AgencyTrip.exists({ tripCode: candidate });

    if (!existing) {
      return candidate;
    }
  }

  throw new Error("Could not generate a unique trip code.");
}

export function validateManagedTripCodeInput(value: unknown, options?: { allowBlank?: boolean }) {
  const normalizedTripCode = normalizeTripCode(value);

  if (!normalizedTripCode) {
    if (options?.allowBlank) {
      return { data: "" } as const;
    }

    return { error: "Trip code is required." } as const;
  }

  if (normalizedTripCode.length < MIN_TRIP_CODE_LENGTH || normalizedTripCode.length > MAX_TRIP_CODE_LENGTH) {
    return { error: "Trip code must be between 4 and 24 letters or numbers." } as const;
  }

  return { data: normalizedTripCode } as const;
}

export async function isTripCodeAvailable(tripCode: string, excludeTripId?: string) {
  const existingTrip = await AgencyTrip.findOne({
    tripCode,
    ...(excludeTripId ? { _id: { $ne: excludeTripId } } : {})
  })
    .select("_id")
    .lean();

  return !existingTrip;
}

export async function ensureTripCodeForTrip(tripId: string) {
  const trip = await AgencyTrip.findById(tripId).select("_id tripCode");

  if (!trip) {
    return null;
  }

  if (trip.tripCode) {
    return String(trip.tripCode);
  }

  const tripCode = await generateUniqueTripCode();
  trip.tripCode = tripCode;
  await trip.save();
  return tripCode;
}

export async function validateTripCodeForRentalAction({
  tripCode,
  rentalItemId
}: {
  tripCode: string;
  rentalItemId: string;
}) {
  const normalizedTripCode = normalizeTripCode(tripCode);

  if (!normalizedTripCode) {
    return { error: "Trip code is required." } as const;
  }

  const [trip, item] = await Promise.all([
    AgencyTrip.findOne({ tripCode: normalizedTripCode, status: "active" }).select("_id agency tripCode renterPartners"),
    RentalItem.findById(rentalItemId).select("_id renter status availabilityStatus quantityAvailable")
  ]);

  if (!trip) {
    return { error: "Invalid trip code." } as const;
  }

  if (!item) {
    return { error: "Rental item not found." } as const;
  }

  const [agency, acceptedPartnerIds] = await Promise.all([
    AgencyProfile.findById(trip.agency).select("linkedRenterPartners"),
    getAcceptedRenterPartnerIdsForAgency(String(trip.agency))
  ]);

  if (!agency) {
    return { error: "Agency profile not found." } as const;
  }

  const acceptedPartnerIdSet = new Set(acceptedPartnerIds);
  const allowedRenterIds = new Set([
    ...(Array.isArray(agency.linkedRenterPartners)
      ? agency.linkedRenterPartners
          .map((id: any) => String(id))
          .filter((id: string) => acceptedPartnerIdSet.has(id))
      : []),
    ...(Array.isArray(trip.renterPartners)
      ? trip.renterPartners.map((id: any) => String(id)).filter((id: string) => acceptedPartnerIdSet.has(id))
      : [])
  ]);

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

  const renter = await RenterProfile.findById(item.renter).select("phone whatsapp");

  if (!renter) {
    return { error: "Renter profile not found." } as const;
  }

  return {
    data: {
      tripId: String(trip._id),
      agencyId: String(trip.agency),
      phone: renter.phone || "",
      whatsapp: renter.whatsapp || ""
    }
  } as const;
}

export async function findActiveTripByCode(tripCode: string) {
  const normalizedTripCode = normalizeTripCode(tripCode);

  if (!normalizedTripCode) {
    return null;
  }

  const trip = await AgencyTrip.findOne({ tripCode: normalizedTripCode, status: "active" }).select("_id");
  return trip ? String(trip._id) : null;
}
