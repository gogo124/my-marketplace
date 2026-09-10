import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import { getDestinationsForAdmin, validateDestinationPayload } from "@/lib/destinations";
import Destination from "@/models/Destination";

export async function GET() {
  const admin = await getAdminApiSession();
  if ("error" in admin) return admin.error;
  return NextResponse.json({ destinations: await getDestinationsForAdmin() });
}

export async function POST(request: Request) {
  const admin = await getAdminApiSession();
  if ("error" in admin) return admin.error;
  try {
    const validation = validateDestinationPayload(await request.json());
    if ("error" in validation) return NextResponse.json({ error: validation.error }, { status: 400 });
    await connectToDatabase();
    if (await Destination.exists({ slug: validation.data.slug })) return NextResponse.json({ error: "That destination slug is already in use." }, { status: 409 });
    return NextResponse.json({ destination: await Destination.create(validation.data) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create destination." }, { status: 500 });
  }
}
