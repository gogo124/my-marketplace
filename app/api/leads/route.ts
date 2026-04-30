import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { requireAuthenticatedUser } from "@/lib/auth-guard";
import { connectToDatabase } from "@/lib/db";
import { checkRateLimit, getRequestIdentity } from "@/lib/rate-limit";
import { validateLeadPayload, validateLeadStatus } from "@/lib/validation";
import Activity from "@/models/Activity";
import Lead from "@/models/Lead";
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
    const identity = userId || getRequestIdentity(request);
    const rateLimit = checkRateLimit({
      key: `lead:${identity}`,
      limit: 20,
      windowMs: 10 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many contact attempts. Please try again shortly." }, { status: 429 });
    }

    const payload = await request.json();
    const validation = validateLeadPayload(payload);

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    await connectToDatabase();

    const seller = await User.findById(validation.data.sellerId).select("_id");

    if (!seller) {
      return NextResponse.json({ error: "Seller not found." }, { status: 404 });
    }

    let listing = null;
    let activity = null;

    if (validation.data.listingId) {
      listing = await Listing.findOne({
        _id: validation.data.listingId,
        seller: validation.data.sellerId
      }).select("_id title");

      if (!listing) {
        return NextResponse.json({ error: "Listing not found for this seller." }, { status: 404 });
      }
    }

    if (validation.data.activityId) {
      activity = await Activity.findOne({
        _id: validation.data.activityId,
        provider: validation.data.sellerId
      }).select("_id title");

      if (!activity) {
        return NextResponse.json({ error: "Activity not found for this provider." }, { status: 404 });
      }
    }

    const duplicateWindowStart = new Date(Date.now() - 10 * 60 * 1000);
    const isTrackedAction =
      validation.data.type === "whatsapp" || validation.data.type === "call" || validation.data.type === "chat";

    if (validation.data.type === "manual" && validation.data.sellerId !== userId) {
      return NextResponse.json({ error: "Manual leads can only be created for your own seller account." }, { status: 403 });
    }

    if (session?.user?.id && isTrackedAction && (validation.data.listingId || validation.data.activityId)) {
      const duplicateLead = await Lead.findOne({
        listingId: validation.data.listingId,
        activityId: validation.data.activityId || null,
        sellerId: validation.data.sellerId,
        buyerId: userId,
        type: validation.data.type,
        createdAt: { $gte: duplicateWindowStart }
      }).select("_id");

      if (duplicateLead) {
        return NextResponse.json({ error: "This contact action was already tracked recently." }, { status: 409 });
      }
    }

    const lead = await Lead.create({
      listingId: validation.data.listingId || null,
      activityId: validation.data.activityId || null,
      sellerId: validation.data.sellerId,
      buyerId: validation.data.type === "manual" ? null : userId,
      type: validation.data.type,
      source: validation.data.source,
      name: validation.data.name,
      phone: validation.data.phone,
      city: validation.data.city,
      preferredDate: validation.data.preferredDate ? new Date(validation.data.preferredDate) : null,
      message: validation.data.message,
      status: validation.data.status || "new",
      customProductName: validation.data.customProductName || "",
      unitPrice: validation.data.unitPrice,
      quantity: validation.data.quantity,
      notes: validation.data.notes || "",
      isExternalOrder: Boolean(validation.data.isExternalOrder)
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not track lead.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getAuthSession();
    const unauthorizedResponse = requireAuthenticatedUser(session);

    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    const userId = session!.user!.id as string;

    const { leadId, status } = await request.json();

    if (!leadId || !validateLeadStatus(status)) {
      return NextResponse.json({ error: "Invalid lead status update." }, { status: 400 });
    }

    await connectToDatabase();

    const lead = await Lead.findOneAndUpdate(
      { _id: leadId, sellerId: userId },
      { $set: { status } },
      { new: true }
    );

    if (!lead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update lead.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
