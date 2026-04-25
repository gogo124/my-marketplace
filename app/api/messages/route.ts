import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { requireAuthenticatedUser } from "@/lib/auth-guard";
import { connectToDatabase } from "@/lib/db";
import { checkRateLimit, getRequestIdentity } from "@/lib/rate-limit";
import { validateMessagePayload } from "@/lib/validation";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    const unauthorizedResponse = requireAuthenticatedUser(session);

    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    const userId = session!.user!.id as string;

    const rateLimit = checkRateLimit({
      key: `message:${userId}:${getRequestIdentity(request, userId)}`,
      limit: 20,
      windowMs: 10 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many messages. Please try again shortly." }, { status: 429 });
    }

    const payload = await request.json();
    const validation = validateMessagePayload(payload);

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    await connectToDatabase();

    const conversation = await Conversation.findById(validation.data.conversationId);

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }

    if (!conversation.participants.some((participant) => participant.toString() === userId)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const duplicateWindowStart = new Date(Date.now() - 2 * 60 * 1000);
    const duplicateMessage = await Message.findOne({
      conversation: validation.data.conversationId,
      sender: userId,
      body: validation.data.body,
      createdAt: { $gte: duplicateWindowStart }
    }).select("_id");

    if (duplicateMessage) {
      return NextResponse.json({ error: "Duplicate message blocked. Edit the message and try again." }, { status: 409 });
    }

    const message = await Message.create({
      conversation: validation.data.conversationId,
      sender: userId,
      body: validation.data.body
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not send message.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
