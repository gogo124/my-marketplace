import { NextResponse } from "next/server";
import { deleteAgencyByAdmin } from "@/lib/admin-delete";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import AgencyProfile from "@/models/AgencyProfile";
import User from "@/models/User";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const adminSession = await getAdminApiSession();

  if ("error" in adminSession) {
    return adminSession.error;
  }

  try {
    const { id } = await context.params;
    const { verificationStatus } = await request.json();

    if (!["unverified", "pending", "verified"].includes(verificationStatus)) {
      return NextResponse.json({ error: "Invalid agency verification status." }, { status: 400 });
    }

    await connectToDatabase();

    const agency = await AgencyProfile.findByIdAndUpdate(
      id,
      { $set: { verificationStatus } },
      { new: true }
    ).populate("user", "name email");

    if (!agency) {
      return NextResponse.json({ error: "Agency not found." }, { status: 404 });
    }

    if (agency.user?._id) {
      await User.findByIdAndUpdate(agency.user._id, {
        $set: {
          sellerVerificationStatus: verificationStatus === "verified" ? "verified" : "unverified",
          verified: verificationStatus === "verified"
        }
      });
    }

    return NextResponse.json({ agency });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update agency verification.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const adminSession = await getAdminApiSession();

  if ("error" in adminSession) {
    return adminSession.error;
  }

  try {
    const { id } = await context.params;

    await connectToDatabase();

    const agency = await deleteAgencyByAdmin(id);

    if (!agency) {
      return NextResponse.json({ error: "Agency not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete agency.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
