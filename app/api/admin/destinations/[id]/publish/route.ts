import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import Destination from "@/models/Destination";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminApiSession();
  if ("error" in admin) return admin.error;
  try {
    const { id } = await params;
    const body = await request.json();
    if (typeof body?.published !== "boolean") return NextResponse.json({ error: "published must be a boolean." }, { status: 400 });
    await connectToDatabase();
    const destination = await Destination.findByIdAndUpdate(id, { $set: { published: body.published } }, { new: true, runValidators: true });
    if (!destination) return NextResponse.json({ error: "Destination not found." }, { status: 404 });
    return NextResponse.json({ destination });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update destination status." }, { status: 500 });
  }
}
