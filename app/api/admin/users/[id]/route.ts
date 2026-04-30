import { NextResponse } from "next/server";
import { deleteUserByAdmin } from "@/lib/admin-delete";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import type { SellerStatus } from "@/lib/seller";
import { getEffectiveSellerStatus, normalizeSellerStatus } from "@/lib/seller";
import Listing from "@/models/Listing";
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
    const {
      sellerVerificationStatus,
      accountStatus,
      canCreateAgency,
      canCreateRenter,
      role,
      sellerStatus,
      sellerPlan,
      sellerExpiresAt,
      activityProviderStatus
    } =
      await request.json();
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

    if (role !== undefined) {
      if (!["user", "agency", "renter", "admin"].includes(role)) {
        return NextResponse.json({ error: "Invalid role value." }, { status: 400 });
      }

      update.role = role;

      if (role === "agency") {
        update.canCreateAgency = true;
        update.canCreateRenter = false;
      } else if (role === "renter") {
        update.canCreateRenter = true;
        update.canCreateAgency = false;
      } else if (role === "admin") {
        update.canCreateAgency = false;
        update.canCreateRenter = false;
      }
    }

    if (sellerStatus !== undefined) {
      if (!["none", "pending", "active", "expired", "suspended", "rejected"].includes(sellerStatus)) {
        return NextResponse.json({ error: "Invalid seller status value." }, { status: 400 });
      }

      const normalizedStatus = normalizeSellerStatus(sellerStatus);
      update.sellerStatus = normalizedStatus;

      if (normalizedStatus === "active") {
        update.sellerApprovedAt = new Date();
        if (sellerExpiresAt === undefined) {
          const defaultExpiry = new Date();
          defaultExpiry.setMonth(defaultExpiry.getMonth() + 1);
          update.sellerExpiresAt = defaultExpiry;
        }
      }
    }

    if (sellerPlan !== undefined) {
      if (sellerPlan !== "free" && sellerPlan !== "monthly" && sellerPlan !== null) {
        return NextResponse.json({ error: "Invalid seller plan value." }, { status: 400 });
      }

      update.sellerPlan = sellerPlan;
    }

    if (sellerExpiresAt !== undefined) {
      if (sellerExpiresAt === null || sellerExpiresAt === "") {
        update.sellerExpiresAt = null;
      } else {
        const parsedExpiry = new Date(String(sellerExpiresAt));

        if (!Number.isFinite(parsedExpiry.getTime())) {
          return NextResponse.json({ error: "Invalid seller expiry date." }, { status: 400 });
        }

        update.sellerExpiresAt = parsedExpiry;
      }
    }

    if (activityProviderStatus !== undefined) {
      if (!["none", "pending", "active", "suspended", "rejected"].includes(activityProviderStatus)) {
        return NextResponse.json({ error: "Invalid activity provider status value." }, { status: 400 });
      }

      update.activityProviderStatus = activityProviderStatus;

      if (activityProviderStatus === "active") {
        update.activityProviderApprovedAt = new Date();
        if (!("activityProviderRequestedAt" in update)) {
          update.activityProviderRequestedAt = new Date();
        }
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No valid admin update provided." }, { status: 400 });
    }

    await connectToDatabase();

    const currentUser = await User.findById(id).select(
      "sellerStatus sellerPlan sellerExpiresAt sellerRequestedAt sellerApprovedAt activityProviderStatus activityProviderRequestedAt activityProviderApprovedAt"
    );

    if (!currentUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (update.sellerStatus === "active" && !currentUser.sellerRequestedAt) {
      update.sellerRequestedAt = currentUser.sellerRequestedAt || new Date();
    }

    if (update.activityProviderStatus === "active" && !currentUser.activityProviderRequestedAt) {
      update.activityProviderRequestedAt = currentUser.activityProviderRequestedAt || new Date();
    }

    const mergedSellerState = {
      sellerStatus: (update.sellerStatus ?? currentUser.sellerStatus) as SellerStatus | null | undefined,
      sellerExpiresAt: (update.sellerExpiresAt ?? currentUser.sellerExpiresAt) as string | Date | null | undefined
    };
    const nextEffectiveSellerStatus = getEffectiveSellerStatus(mergedSellerState);

    const user = await User.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    ).select(
      "name email role sellerVerificationStatus verified accountStatus canCreateAgency canCreateRenter sellerStatus sellerPlan sellerExpiresAt sellerRequestedAt sellerApprovedAt sellerProfile activityProviderStatus activityProviderRequestedAt activityProviderApprovedAt activityProviderProfile"
    );

    if (nextEffectiveSellerStatus !== "active") {
      await Listing.updateMany(
        { seller: id, status: "active" },
        { $set: { status: "inactive" } }
      );
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
