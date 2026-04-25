import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { deleteReviewByAdmin } from "@/lib/admin-delete";
import { connectToDatabase } from "@/lib/db";
import Review from "@/models/Review";

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

    const review = await Review.findByIdAndUpdate(id, { status: "approved" }, { new: true }).lean();

    if (!review) {
      return NextResponse.json({ error: "Review not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, review });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not approve review.";
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

    const review = await deleteReviewByAdmin(id);

    if (!review) {
      return NextResponse.json({ error: "Review not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete review.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
