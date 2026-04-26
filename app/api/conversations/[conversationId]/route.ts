import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { requireAuthenticatedUser } from "@/lib/auth-guard";
import { connectToDatabase } from "@/lib/db";
import Conversation from "@/models/Conversation";

export async function PATCH(
  _request: Request,
  {
    params
  }: {
    params: Promise<{ conversationId: string }>;
  }
) {
  try {
    const session = await getAuthSession();
    const unauthorizedResponse = requireAuthenticatedUser(session);

    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    const userId = session!.user!.id as string;
    const { conversationId } = await params;

    await connectToDatabase();

    const conversation = (await Conversation.findById(conversationId)) as any;

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }

    if (!conversation.participants.some((participant: any) => participant.toString() === userId)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const now = new Date();
    const readState = Array.isArray(conversation.readState) ? conversation.readState : [];
    const existingIndex = readState.findIndex((entry: any) => String(entry.user?._id || entry.user) === String(userId));

    if (existingIndex >= 0) {
      readState[existingIndex].lastReadAt = now;
    } else {
      readState.push({ user: userId, lastReadAt: now });
    }

    conversation.readState = readState;
    await conversation.save();

    return NextResponse.json({
      success: true,
      conversationId,
      lastReadAt: now.toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not mark conversation as read.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
