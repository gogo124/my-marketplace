import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { requireAuthenticatedUser } from "@/lib/auth-guard";
import { connectToDatabase } from "@/lib/db";
import { checkRateLimit, getRequestIdentity } from "@/lib/rate-limit";
import { validateLeadPayload, validateLeadStatus } from "@/lib/validation";
import Lead from "@/models/Lead";
import Listing from "@/models/Listing";

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

    const listing = await Listing.findOne({
      _id: validation.data.listingId,
      seller: validation.data.sellerId
    }).select("_id");

    if (!listing) {
      return NextResponse.json({ error: "Listing not found for this seller." }, { status: 404 });
    }

    const duplicateWindowStart = new Date(Date.now() - 10 * 60 * 1000);
    if (session?.user?.id) {
      const duplicateLead = await Lead.findOne({
        listingId: validation.data.listingId,
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
      listingId: validation.data.listingId,
      sellerId: validation.data.sellerId,
      buyerId: userId,
      type: validation.data.type,
      status: "new"
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
