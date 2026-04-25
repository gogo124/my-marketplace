import { NextResponse } from "next/server";
import { deleteUserByAdmin } from "@/lib/admin-delete";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
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
    const { sellerVerificationStatus, accountStatus, canCreateAgency, canCreateRenter } = await request.json();
    const update: Record<string, unknown> = {};

    if (sellerVerificationStatus !== undefined) {
      if (!["unverified", "verified"].includes(sellerVerificationStatus)) {
        return NextResponse.json({ error: "Invalid seller verification status." }, { status: 400 });
      }

      update.sellerVerificationStatus = sellerVerificationStatus;
      update.verified = sellerVerificationStatus === "verified";
    }

    if (accountStatus !== undefined) {
      if (!["active", "disabled"].includes(accountStatus)) {
        return NextResponse.json({ error: "Invalid account status." }, { status: 400 });
      }

      update.accountStatus = accountStatus;
    }

    if (canCreateAgency !== undefined) {
      if (typeof canCreateAgency !== "boolean") {
        return NextResponse.json({ error: "Invalid agency permission value." }, { status: 400 });
      }

      update.canCreateAgency = canCreateAgency;
    }

    if (canCreateRenter !== undefined) {
      if (typeof canCreateRenter !== "boolean") {
        return NextResponse.json({ error: "Invalid renter permission value." }, { status: 400 });
      }

      update.canCreateRenter = canCreateRenter;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No valid admin update provided." }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    ).select("name email sellerVerificationStatus verified accountStatus canCreateAgency canCreateRenter");

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update user verification.";
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

    const user = await deleteUserByAdmin(id);

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete user.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
