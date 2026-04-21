import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Lead from "@/models/Lead";

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    const { listingId, sellerId, type } = await request.json();

    if (!listingId || !sellerId || !["whatsapp", "call", "chat"].includes(type)) {
      return NextResponse.json({ error: "Invalid lead payload." }, { status: 400 });
    }

    await connectToDatabase();

    const lead = await Lead.create({
      listingId,
      sellerId,
      buyerId: session?.user?.id ?? null,
      type
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not track lead.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
