import { connectToDatabase } from "@/lib/db";
import { serializeDocument } from "@/lib/utils";
import AgencyProfile from "@/models/AgencyProfile";
import AgencyRenterPartnership from "@/models/AgencyRenterPartnership";
import RenterProfile from "@/models/RenterProfile";

type PartnershipStatus = "none" | "pending" | "accepted" | "rejected";

function mapPartnershipStatus(value: unknown): PartnershipStatus {
  if (value === "pending" || value === "accepted" || value === "rejected") {
    return value;
  }

  return "none";
}

export async function getAcceptedRenterPartnerIdsForAgency(agencyId: string) {
  await connectToDatabase();

  const partnerships = await AgencyRenterPartnership.find({
    agency: agencyId,
    status: "accepted"
  })
    .select("renter")
    .lean();

  return partnerships.map((partnership: any) => String(partnership.renter));
}

export async function getAcceptedAgencyPartnerIdsForRenter(renterId: string) {
  await connectToDatabase();

  const partnerships = await AgencyRenterPartnership.find({
    renter: renterId,
    status: "accepted"
  })
    .select("agency")
    .lean();

  return partnerships.map((partnership: any) => String(partnership.agency));
}

export async function getAgencyPartnershipData(agencyId: string) {
  await connectToDatabase();

  const [renters, partnerships] = await Promise.all([
    RenterProfile.find({ verificationStatus: { $in: ["pending", "verified"] } }).sort({ createdAt: -1 }).lean(),
    AgencyRenterPartnership.find({ agency: agencyId })
      .populate("renter", "name city logo verificationStatus")
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean()
  ]);

  const serializedRenters = serializeDocument(renters) as any[];
  const serializedPartnerships = serializeDocument(partnerships) as any[];
  const partnershipByRenterId = new Map(
    serializedPartnerships.map((partnership: any) => [String(partnership.renter?._id || partnership.renter), partnership])
  );

  const directory = serializedRenters.map((renter) => {
    const partnership = partnershipByRenterId.get(String(renter._id));

    return {
      ...renter,
      partnershipId: partnership?._id || null,
      partnershipStatus: mapPartnershipStatus(partnership?.status),
      requestedByRole: partnership?.requestedByRole || null
    };
  });

  return {
    directory,
    accepted: directory.filter((entry) => entry.partnershipStatus === "accepted"),
    incomingRequests: directory.filter(
      (entry) => entry.partnershipStatus === "pending" && entry.requestedByRole === "renter"
    ),
    outgoingRequests: directory.filter(
      (entry) => entry.partnershipStatus === "pending" && entry.requestedByRole === "agency"
    )
  };
}

export async function getRenterPartnershipData(renterId: string) {
  await connectToDatabase();

  const [agencies, partnerships] = await Promise.all([
    AgencyProfile.find({ verificationStatus: { $in: ["pending", "verified"] } }).sort({ createdAt: -1 }).lean(),
    AgencyRenterPartnership.find({ renter: renterId })
      .populate("agency", "name city logo verificationStatus")
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean()
  ]);

  const serializedAgencies = serializeDocument(agencies) as any[];
  const serializedPartnerships = serializeDocument(partnerships) as any[];
  const partnershipByAgencyId = new Map(
    serializedPartnerships.map((partnership: any) => [String(partnership.agency?._id || partnership.agency), partnership])
  );

  const directory = serializedAgencies.map((agency) => {
    const partnership = partnershipByAgencyId.get(String(agency._id));

    return {
      ...agency,
      partnershipId: partnership?._id || null,
      partnershipStatus: mapPartnershipStatus(partnership?.status),
      requestedByRole: partnership?.requestedByRole || null
    };
  });

  return {
    directory,
    accepted: directory.filter((entry) => entry.partnershipStatus === "accepted"),
    incomingRequests: directory.filter(
      (entry) => entry.partnershipStatus === "pending" && entry.requestedByRole === "agency"
    ),
    outgoingRequests: directory.filter(
      (entry) => entry.partnershipStatus === "pending" && entry.requestedByRole === "renter"
    )
  };
}
