import { NextResponse } from "next/server";
import { createRouteErrorResponse } from "@/lib/api-errors";
import { connectToDatabase } from "@/lib/db";
import { checkRateLimit, getRequestIdentity } from "@/lib/rate-limit";
import { getUntrustedOriginResponse, isTrustedOrigin } from "@/lib/request-guard";
import AnalyticsEvent from "@/models/AnalyticsEvent";

const ALLOWED_TYPES = new Set([
  "page_view",
  "booking_click",
  "whatsapp_click",
  "listing_click",
  "reservation_attempt",
  "reservation_success"
]);

export async function POST(request: Request) {
  try {
    if (!isTrustedOrigin(request)) {
      return getUntrustedOriginResponse();
    }

    const rateLimit = checkRateLimit({
      key: `analytics:${getRequestIdentity(request)}`,
      limit: 300,
      windowMs: 10 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many analytics events." }, { status: 429 });
    }

    const payload = await request.json().catch(() => ({}));
    const type = String(payload?.type || "").trim();
    const page = String(payload?.page || "").trim();
    const timestampValue = payload?.timestamp ? new Date(payload.timestamp) : new Date();

    if (!ALLOWED_TYPES.has(type) || !page) {
      return NextResponse.json({ error: "Invalid analytics payload." }, { status: 400 });
    }

    await connectToDatabase();

    await AnalyticsEvent.create({
      type,
      page,
      timestamp: Number.isFinite(timestampValue.getTime()) ? timestampValue : new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return createRouteErrorResponse(error, "Could not record analytics event.");
  }
}
