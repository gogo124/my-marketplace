import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { deletePlaceByAdmin } from "@/lib/admin-delete";
import { connectToDatabase } from "@/lib/db";
import Place from "@/models/Place";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const adminSession = await getAdminApiSession();

  if ("error" in adminSession) {
    return adminSession.error;
  }

  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const nextStatus = body?.status === "pending" ? "pending" : "approved";
    await connectToDatabase();

    const place = await Place.findByIdAndUpdate(id, { status: nextStatus }, { new: true }).lean();

    if (!place) {
      return NextResponse.json({ error: "Place not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      place,
      message: nextStatus === "approved" ? "Place is now visible publicly." : "Place moved back to pending review."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not approve place.";
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

    const place = await deletePlaceByAdmin(id);

    if (!place) {
      return NextResponse.json({ error: "Place not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete place.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
