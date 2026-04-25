import { NextResponse } from "next/server";
import { deleteListingByAdmin } from "@/lib/admin-delete";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import Listing from "@/models/Listing";

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
    const { status } = await request.json();

    if (!["active", "inactive"].includes(status)) {
      return NextResponse.json({ error: "Invalid listing status." }, { status: 400 });
    }

    await connectToDatabase();

    const listing = await Listing.findByIdAndUpdate(id, { $set: { status } }, { new: true }).select("title status");

    if (!listing) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }

    return NextResponse.json({ listing });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update listing.";
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

    const listing = await deleteListingByAdmin(id);

    if (!listing) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete listing.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
