import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Review from "@/models/Review";

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { listingId, rating, comment } = await request.json();

    if (!listingId || !comment || Number(rating) < 1 || Number(rating) > 5) {
      return NextResponse.json({ error: "Invalid review payload." }, { status: 400 });
    }

    await connectToDatabase();

    const review = await Review.create({
      listing: listingId,
      author: session.user.id,
      rating: Number(rating),
      comment: String(comment).trim()
    });

    const populatedReview = await review.populate("author", "name");
    return NextResponse.json({ review: populatedReview }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create review.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
