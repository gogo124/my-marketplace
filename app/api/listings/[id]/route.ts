import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Listing from "@/models/Listing";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();

  const { id } = await params;
  const listing = await Listing.findById(id).populate("seller", "name email avatar");

  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  return NextResponse.json({ listing });
}
