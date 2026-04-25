import { NextResponse } from "next/server";
import { deleteMessageByAdmin } from "@/lib/admin-delete";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const adminSession = await getAdminApiSession();

  if ("error" in adminSession) {
    return adminSession.error;
  }

  try {
    const { id } = await context.params;

    await connectToDatabase();

    const message = await deleteMessageByAdmin(id);

    if (!message) {
      return NextResponse.json({ error: "Message not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete message.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
