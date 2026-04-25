import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { requireAuthenticatedUser } from "@/lib/auth-guard";
import { connectToDatabase } from "@/lib/db";
import { getRequestIdentity, checkRateLimit } from "@/lib/rate-limit";
import { validateConversationPayload } from "@/lib/validation";
import Conversation from "@/models/Conversation";
import Listing from "@/models/Listing";

export async function GET() {
  try {
    const session = await getAuthSession();
    const unauthorizedResponse = requireAuthenticatedUser(session);

    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    const userId = session!.user!.id as string;

    await connectToDatabase();

    const conversations = await Conversation.find({ participants: userId })
      .populate("listing", "title price")
      .populate("participants", "name email avatar")
      .sort({ lastMessageAt: -1 });

    return NextResponse.json({ conversations });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not fetch conversations.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    const unauthorizedResponse = requireAuthenticatedUser(session);

    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    const userId = session!.user!.id as string;

    const rateLimit = checkRateLimit({
      key: `conversation:${userId}:${getRequestIdentity(request, userId)}`,
      limit: 10,
      windowMs: 10 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many conversation requests. Please try again shortly." }, { status: 429 });
    }

    const payload = await request.json();
    const validation = validateConversationPayload(payload);

    if ("error" in validation || validation.data.sellerId === userId) {
      return NextResponse.json({ error: "Invalid conversation payload." }, { status: 400 });
    }

    await connectToDatabase();

    const listing = await Listing.findOne({
      _id: validation.data.listingId,
      seller: validation.data.sellerId
    }).select("_id seller");

    if (!listing) {
      return NextResponse.json({ error: "Listing not found for this seller." }, { status: 404 });
    }

    let conversation = await Conversation.findOne({
      listing: validation.data.listingId,
      participants: { $all: [userId, validation.data.sellerId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        listing: validation.data.listingId,
        participants: [userId, validation.data.sellerId],
        lastMessageAt: new Date()
      });
    }

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create conversation.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
