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

    const permissions = getUserPermissions(user);
    const canActAsAgency = permissions.canAccessAgencyWorkspace;
    const canActAsRenter = permissions.canAccessRenterWorkspace;

    if (!canActAsAgency && !canActAsRenter) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const { targetId } = await request.json();

    if (!targetId || typeof targetId !== "string") {
      return NextResponse.json({ error: "Target partner is required." }, { status: 400 });
    }

    await connectToDatabase();

    if (canActAsAgency) {
      const [agency, renter] = await Promise.all([
        AgencyProfile.findOne({ user: user.id }).select("_id"),
        RenterProfile.findById(targetId).select("_id")
      ]);

      if (!agency) {
        return NextResponse.json({ error: "Agency profile not found." }, { status: 404 });
      }

      if (!renter) {
        return NextResponse.json({ error: "Renter profile not found." }, { status: 404 });
      }

      const existingPartnership = await AgencyRenterPartnership.findOne({
        agency: agency._id,
        renter: renter._id
      }).select("_id status");

      if (existingPartnership?.status === "accepted") {
        return NextResponse.json({ error: "This partnership is already accepted." }, { status: 409 });
      }

      const partnership = await AgencyRenterPartnership.findOneAndUpdate(
        { agency: agency._id, renter: renter._id },
        {
          $set: {
            requestedByRole: "agency",
            status: "pending",
            respondedAt: null
          }
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );

      return NextResponse.json({ partnership }, { status: 201 });
    }

    const [renter, agency] = await Promise.all([
      RenterProfile.findOne({ user: user.id }).select("_id"),
      AgencyProfile.findById(targetId).select("_id")
    ]);

    if (!renter) {
      return NextResponse.json({ error: "Renter profile not found." }, { status: 404 });
    }

    if (!agency) {
      return NextResponse.json({ error: "Agency profile not found." }, { status: 404 });
    }

    const existingPartnership = await AgencyRenterPartnership.findOne({
      agency: agency._id,
      renter: renter._id
    }).select("_id status");

    if (existingPartnership?.status === "accepted") {
      return NextResponse.json({ error: "This partnership is already accepted." }, { status: 409 });
    }

    const partnership = await AgencyRenterPartnership.findOneAndUpdate(
      { agency: agency._id, renter: renter._id },
      {
        $set: {
          requestedByRole: "renter",
          status: "pending",
          respondedAt: null
        }
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    return NextResponse.json({ partnership }, { status: 201 });
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

    const permissions = getUserPermissions(user);
    const canActAsAgency = permissions.canAccessAgencyWorkspace;
    const canActAsRenter = permissions.canAccessRenterWorkspace;

    if (!canActAsAgency && !canActAsRenter) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const { partnershipId, status } = await request.json();

    if (!partnershipId || (status !== "accepted" && status !== "rejected")) {
      return NextResponse.json({ error: "Invalid partnership update." }, { status: 400 });
    }

    await connectToDatabase();

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
      const agency = await AgencyProfile.findOne({ user: user.id }).select("_id");

      if (!agency) {
        return NextResponse.json({ error: "Agency profile not found." }, { status: 404 });
      }

      const partnership = await AgencyRenterPartnership.findOneAndUpdate(
        {
          _id: partnershipId,
          agency: agency._id,
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

    const renter = await RenterProfile.findOne({ user: user.id }).select("_id");

    if (!renter) {
      return NextResponse.json({ error: "Renter profile not found." }, { status: 404 });
    }

    const partnership = await AgencyRenterPartnership.findOneAndUpdate(
      {
        _id: partnershipId,
        renter: renter._id,
        requestedByRole: "agency",
        status: "pending"
      },
      { $set: { status, respondedAt: new Date() } },
      { new: true }
    );

    if (!partnership) {
      return NextResponse.json({ error: "Partnership request not found." }, { status: 404 });
    }

    return NextResponse.json({ partnership });
  } catch (error) {
    return createRouteErrorResponse(error, "Could not update partnership request.");
  }
}
