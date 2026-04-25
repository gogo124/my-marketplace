import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { toggleSavedPlace } from "@/lib/camping";
import { connectToDatabase } from "@/lib/db";
import Place from "@/models/Place";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await context.params;
    await connectToDatabase();

    const place = await Place.findById(id).select("_id status").lean();

    if (!place || place.status !== "approved") {
      return NextResponse.json({ error: "Place not found." }, { status: 404 });
    }

    const result = await toggleSavedPlace(session.user.id, id);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save place.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
