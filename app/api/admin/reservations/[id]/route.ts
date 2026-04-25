import { NextResponse } from "next/server";
import { deleteReservationByAdmin } from "@/lib/admin-delete";
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

    const reservation = await deleteReservationByAdmin(id);

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete reservation.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
