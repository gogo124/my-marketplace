import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { deleteStoryByAdmin } from "@/lib/admin-delete";
import { connectToDatabase } from "@/lib/db";
import Story from "@/models/Story";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
  const adminSession = await getAdminApiSession();

  if ("error" in adminSession) {
    return adminSession.error;
  }

  try {
    const { id } = await context.params;
    await connectToDatabase();

    const story = await Story.findByIdAndUpdate(id, { status: "approved" }, { new: true }).lean();

    if (!story) {
      return NextResponse.json({ error: "Story not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, story });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not approve story.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const adminSession = await getAdminApiSession();

  if ("error" in adminSession) {
    return adminSession.error;
  }

  try {
    const { id } = await context.params;
    await connectToDatabase();

    const story = await deleteStoryByAdmin(id);

    if (!story) {
      return NextResponse.json({ error: "Story not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete story.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
