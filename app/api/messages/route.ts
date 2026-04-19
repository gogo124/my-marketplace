import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { conversationId, body } = await request.json();

    if (!conversationId || !body) {
      return NextResponse.json(
        { error: "Conversation and message body are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }

    if (!conversation.participants.some((participant) => participant.toString() === session.user.id)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: session.user.id,
      body
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not send message.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
