import { NextResponse } from "next/server";
import { createRouteErrorResponse } from "@/lib/api-errors";
import { getAuthSession } from "@/lib/auth";
import { requireAuthenticatedUser } from "@/lib/auth-guard";
import { connectToDatabase } from "@/lib/db";
import { normalizeSellerStatus } from "@/lib/seller";
import { checkRateLimit, getRequestIdentity } from "@/lib/rate-limit";
import { validateSellerAccessRequestPayload } from "@/lib/validation";
import Listing from "@/models/Listing";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    const unauthorizedResponse = requireAuthenticatedUser(session);

    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    const userId = session!.user!.id as string;
    const rateLimit = checkRateLimit({
      key: `seller-request:${userId}:${getRequestIdentity(request, userId)}`,
      limit: 5,
      windowMs: 30 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many seller access requests. Please try again later." }, { status: 429 });
    }

    const payload = await request.json();
    const validation = validateSellerAccessRequestPayload(payload);

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findById(userId).select(
      "sellerStatus sellerPlan sellerExpiresAt sellerRequestedAt sellerApprovedAt sellerProfile"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const currentStatus = normalizeSellerStatus(user.sellerStatus);

    if (currentStatus !== "none") {
      return NextResponse.json({ error: "Seller access request is not available for this account." }, { status: 400 });
    }

    user.sellerStatus = "pending";
    user.sellerRequestedAt = new Date();
    user.sellerApprovedAt = null;
    user.sellerPlan = null;
    user.sellerExpiresAt = null;
    user.sellerProfile = validation.data;
    await user.save();

    const userHasListings = await Listing.exists({ seller: userId });

    if (userHasListings) {
      await Listing.updateMany(
        { seller: userId, status: "active" },
        { $set: { status: "inactive" } }
      );
    }

    return NextResponse.json({
      success: true,
      sellerStatus: "pending",
      message: "Seller access request sent and waiting for admin approval."
    });
  } catch (error) {
    return createRouteErrorResponse(error, "Could not submit seller access request.");
  }
}
