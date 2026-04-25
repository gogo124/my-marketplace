import { NextResponse } from "next/server";
import { deleteTravelPostByAdmin } from "@/lib/admin-delete";
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

    const post = await deleteTravelPostByAdmin(id);

    if (!post) {
      return NextResponse.json({ error: "Travel post not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete travel post.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
