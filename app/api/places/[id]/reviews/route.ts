import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getSubmittedImageUrls, validateSubmittedImageUrls } from "@/lib/image-upload";
import { checkRateLimit, getRequestIdentity } from "@/lib/rate-limit";
import { canUserReviewPlace } from "@/lib/reviews";
import { validatePlaceReviewPayload } from "@/lib/validation";
import Review from "@/models/Review";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await connectToDatabase();

    const reviews = await Review.find({ place: id, status: "approved" })
      .populate("author", "name avatar")
      .sort({ createdAt: -1 });

    return NextResponse.json({ reviews });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not fetch place reviews.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await context.params;
    const rateLimit = checkRateLimit({
      key: `place-review:${id}:${session.user.id}:${getRequestIdentity(request, session.user.id)}`,
      limit: 5,
      windowMs: 60 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many review attempts. Please try again later." }, { status: 429 });
    }

    const formData = await request.formData();
    const imageUrls = getSubmittedImageUrls(formData, "image");
    const validation = validatePlaceReviewPayload({
      rating: formData.get("rating"),
      comment: formData.get("comment")
    });

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const imageValidationError = validateSubmittedImageUrls({
      urls: imageUrls,
      maxFiles: 3,
      label: "review images"
    });

    if (imageValidationError) {
      return NextResponse.json({ error: imageValidationError }, { status: 400 });
    }

    const eligibility = await canUserReviewPlace(session.user.id, id);

    if (!eligibility.allowed) {
      return NextResponse.json({ error: eligibility.reason }, { status: eligibility.reason === "Place not found." ? 404 : 400 });
    }

    const existingReview = await Review.findOne({ place: id, author: session.user.id }).select("_id").lean();

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this place." }, { status: 409 });
    }
    const review = await Review.create({
      place: id,
      author: session.user.id,
      rating: validation.data.rating,
      comment: validation.data.comment,
      image: imageUrls[0] || "",
      images: imageUrls,
      status: "pending"
    });

    const populatedReview = await review.populate("author", "name avatar");
    return NextResponse.json({ review: populatedReview }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create place review.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
