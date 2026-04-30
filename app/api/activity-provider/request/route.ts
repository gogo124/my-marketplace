import { NextResponse } from "next/server";
import { createRouteErrorResponse } from "@/lib/api-errors";
import { getAuthSession } from "@/lib/auth";
import { requireAuthenticatedUser } from "@/lib/auth-guard";
import { connectToDatabase } from "@/lib/db";
import { checkRateLimit, getRequestIdentity } from "@/lib/rate-limit";
import { validateActivityProviderRequestPayload } from "@/lib/validation";
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
      key: `activity-provider-request:${userId}:${getRequestIdentity(request, userId)}`,
      limit: 5,
      windowMs: 30 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many activity provider requests. Please try again later." }, { status: 429 });
    }

    const payload = await request.json();
    const validation = validateActivityProviderRequestPayload(payload);

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findById(userId).select("activityProviderStatus activityProviderProfile");

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (user.activityProviderStatus !== "none") {
      return NextResponse.json({ error: "Activity provider request is not available for this account." }, { status: 400 });
    }

    user.activityProviderStatus = "pending";
    user.activityProviderRequestedAt = new Date();
    user.activityProviderApprovedAt = null;
    user.activityProviderProfile = validation.data;
    await user.save();

    return NextResponse.json({ success: true, activityProviderStatus: "pending" });
  } catch (error) {
    return createRouteErrorResponse(error, "Could not submit activity provider request.");
  }
}
