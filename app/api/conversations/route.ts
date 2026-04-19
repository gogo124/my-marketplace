import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Conversation from "@/models/Conversation";

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();

    const conversations = await Conversation.find({ participants: session.user.id })
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

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { listingId, sellerId } = await request.json();

    if (!listingId || !sellerId || sellerId === session.user.id) {
      return NextResponse.json({ error: "Invalid conversation payload." }, { status: 400 });
    }

    await connectToDatabase();

    let conversation = await Conversation.findOne({
      listing: listingId,
      participants: { $all: [session.user.id, sellerId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        listing: listingId,
        participants: [session.user.id, sellerId],
        lastMessageAt: new Date()
      });
    }

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create conversation.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
