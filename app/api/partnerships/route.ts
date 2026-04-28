import { NextResponse } from "next/server";
import { createRouteErrorResponse } from "@/lib/api-errors";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getSessionUser, getUserPermissions } from "@/lib/permissions";
import AgencyProfile from "@/models/AgencyProfile";
import AgencyRenterPartnership from "@/models/AgencyRenterPartnership";
import RenterProfile from "@/models/RenterProfile";

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    const user = getSessionUser(session);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();

    const [agencyProfile, renterProfile] = await Promise.all([
      AgencyProfile.findOne({ user: user.id }).select("_id"),
      RenterProfile.findOne({ user: user.id }).select("_id")
    ]);

    const permissions = getUserPermissions(user, {
      hasAgencyProfile: Boolean(agencyProfile?._id),
      hasRenterProfile: Boolean(renterProfile?._id)
    });
    const canActAsAgency = permissions.canAccessAgencyWorkspace;
    const canActAsRenter = permissions.canAccessRenterWorkspace;

    if (!canActAsAgency && !canActAsRenter) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const body = await request.json();
    const targetId = typeof body?.targetId === "string" ? body.targetId : null;
    const agencyId = typeof body?.agencyId === "string" ? body.agencyId : null;
    const renterProfileId = typeof body?.renterProfileId === "string" ? body.renterProfileId : null;

    const isRenterRequest = Boolean(agencyId || renterProfileId);

    if (isRenterRequest) {
      if (!canActAsRenter) {
        return NextResponse.json({ error: "Access denied." }, { status: 403 });
      }

      const renter = renterProfile;
      const renterTargetId = agencyId || targetId;

      if (!renter) {
        return NextResponse.json({ error: "Renter profile not found." }, { status: 404 });
      }

      if (!renterTargetId) {
        return NextResponse.json({ error: "Agency partner is required." }, { status: 400 });
      }

      if (renterProfileId && String(renterProfileId) !== String(renter._id)) {
        return NextResponse.json({ error: "Access denied." }, { status: 403 });
      }

      const agency = await AgencyProfile.findById(renterTargetId).select("_id");

      if (!agency) {
        return NextResponse.json({ error: "Agency profile not found." }, { status: 404 });
      }

      const existingPartnership = await AgencyRenterPartnership.findOne({
        agency: agency._id,
        renter: renter._id
      }).select("_id status requestedByRole agency renter respondedAt createdAt updatedAt");

      if (existingPartnership) {
        return NextResponse.json({ partnership: existingPartnership, message: "Partnership already exists." }, { status: 200 });
      }

      const partnership = await AgencyRenterPartnership.create({
        agency: agency._id,
        renter: renter._id,
        requestedByRole: "renter",
        status: "pending",
        respondedAt: null
      });

      return NextResponse.json({ partnership }, { status: 201 });
    }

    if (canActAsAgency) {
      const renterTargetId = targetId;

      if (!renterTargetId) {
        return NextResponse.json({ error: "Target partner is required." }, { status: 400 });
      }

      const agency = agencyProfile;
      const renter = await RenterProfile.findById(renterTargetId).select("_id");

      if (!agency) {
        return NextResponse.json({ error: "Agency profile not found." }, { status: 404 });
      }

      if (!renter) {
        return NextResponse.json({ error: "Renter profile not found." }, { status: 404 });
      }

      const existingPartnership = await AgencyRenterPartnership.findOne({
        agency: agency._id,
        renter: renter._id
      }).select("_id status requestedByRole agency renter respondedAt createdAt updatedAt");

      if (existingPartnership) {
        return NextResponse.json({ partnership: existingPartnership, message: "Partnership already exists." }, { status: 200 });
      }

      const partnership = await AgencyRenterPartnership.create({
        agency: agency._id,
        renter: renter._id,
        requestedByRole: "agency",
        status: "pending",
        respondedAt: null
      });

      return NextResponse.json({ partnership }, { status: 201 });
    }

    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  } catch (error) {
    return createRouteErrorResponse(error, "Could not send partnership request.");
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getAuthSession();
    const user = getSessionUser(session);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();

    const agencyProfile = await AgencyProfile.findOne({ user: user.id }).select("_id");

    const permissions = getUserPermissions(user, {
      hasAgencyProfile: Boolean(agencyProfile?._id),
      hasRenterProfile: false
    });
    const canActAsAgency = permissions.canAccessAgencyWorkspace;

    if (!canActAsAgency && !permissions.canAccessAdminWorkspace) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const { partnershipId, status } = await request.json();

    if (!partnershipId || (status !== "accepted" && status !== "rejected")) {
      return NextResponse.json({ error: "Invalid partnership update." }, { status: 400 });
    }

    if (permissions.canAccessAdminWorkspace) {
      const partnership = await AgencyRenterPartnership.findOneAndUpdate(
        {
          _id: partnershipId,
          status: "pending"
        },
        { $set: { status, respondedAt: new Date() } },
        { new: true }
      );

      if (!partnership) {
        return NextResponse.json({ error: "Partnership request not found." }, { status: 404 });
      }

      return NextResponse.json({ partnership });
    }

    if (canActAsAgency) {
      const partnership = await AgencyRenterPartnership.findOneAndUpdate(
        {
          _id: partnershipId,
          agency: agencyProfile?._id,
          requestedByRole: "renter",
          status: "pending"
        },
        { $set: { status, respondedAt: new Date() } },
        { new: true }
      );

      if (!partnership) {
        return NextResponse.json({ error: "Partnership request not found." }, { status: 404 });
      }

      return NextResponse.json({ partnership });
    }

    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  } catch (error) {
    return createRouteErrorResponse(error, "Could not update partnership request.");
  }
}
