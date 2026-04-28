import { NextResponse } from "next/server";
import { createRouteErrorResponse } from "@/lib/api-errors";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getAcceptedRenterPartnerIdsForAgency } from "@/lib/partnerships";
import { getSessionUser, getUserPermissions } from "@/lib/permissions";
import { validateAgencyRenterLinksPayload } from "@/lib/validation";
import AgencyProfile from "@/models/AgencyProfile";
import RenterProfile from "@/models/RenterProfile";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  try {
    const session = await getAuthSession();
    const user = getSessionUser(session);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const payload = await request.json();
    const validation = validateAgencyRenterLinksPayload(payload);

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    await connectToDatabase();

    const profile = await AgencyProfile.findOne({ user: user.id }).select("_id");
    const permissions = getUserPermissions(user, { hasAgencyProfile: Boolean(profile?._id) });

    if (!permissions.canAccessAgencyWorkspace) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    if (!profile) {
      return NextResponse.json({ error: "Agency profile not found." }, { status: 404 });
    }

    const acceptedPartnerIds = new Set(await getAcceptedRenterPartnerIdsForAgency(String(profile._id)));

    const allPartnerIds = Array.from(
      new Set([
        ...validation.data.linkedRenterPartnerIds,
        ...validation.data.trustedRenterPartnerIds,
        ...validation.data.recommendedRenterPartnerIds
      ])
    );

    if (allPartnerIds.some((partnerId) => !acceptedPartnerIds.has(String(partnerId)))) {
      return NextResponse.json({ error: "Only accepted renter partnerships can be linked." }, { status: 400 });
    }

    if (allPartnerIds.length > 0) {
      const validPartnersCount = await RenterProfile.countDocuments({ _id: { $in: allPartnerIds } });

      if (validPartnersCount !== allPartnerIds.length) {
        return NextResponse.json({ error: "One or more renter partners are invalid." }, { status: 400 });
      }
    }

    const updatedProfile = await AgencyProfile.findByIdAndUpdate(
      profile._id,
      {
        $set: {
          linkedRenterPartners: validation.data.linkedRenterPartnerIds,
          trustedRenterPartners: validation.data.trustedRenterPartnerIds,
          recommendedRenterPartners: validation.data.recommendedRenterPartnerIds
        }
      },
      { new: true }
    );

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    return createRouteErrorResponse(error, "Could not update renter links.");
  }
}
