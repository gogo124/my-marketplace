import { NextResponse } from "next/server";
import { createRouteErrorResponse } from "@/lib/api-errors";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getSubmittedImageUrls, validateSubmittedImageUrls } from "@/lib/image-upload";
import { checkRateLimit, getRequestIdentity } from "@/lib/rate-limit";
import { canUserReplyToReview, canUserReviewListing } from "@/lib/reviews";
import { validateReviewPayload, validateReviewReplyPayload } from "@/lib/validation";
import Review from "@/models/Review";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const rateLimit = checkRateLimit({
      key: `review:${session.user.id}:${getRequestIdentity(request, session.user.id)}`,
      limit: 5,
      windowMs: 60 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many review attempts. Please try again later." }, { status: 429 });
    }

    const formData = await request.formData();
    const imageUrls = getSubmittedImageUrls(formData, "images");
    const imageValidationError = validateSubmittedImageUrls({
      urls: imageUrls,
      maxFiles: 3,
      label: "review images"
    });

    if (imageValidationError) {
      return NextResponse.json({ error: imageValidationError }, { status: 400 });
    }

    const payload = {
      listingId: formData.get("listingId"),
      rating: formData.get("rating"),
      comment: formData.get("comment")
    };
    const validation = validateReviewPayload(payload);

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const eligibility = await canUserReviewListing(session.user.id, validation.data.listingId);

    if (!eligibility.allowed) {
      return NextResponse.json({ error: eligibility.reason }, { status: eligibility.reason === "Listing not found." ? 404 : 400 });
    }

    const existingReview = await Review.findOne({
      listing: validation.data.listingId,
      author: session.user.id
    }).select("_id");

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this listing." }, { status: 409 });
    }
    const review = await Review.create({
      listing: validation.data.listingId,
      author: session.user.id,
      rating: validation.data.rating,
      comment: validation.data.comment,
      image: imageUrls[0] || "",
      images: imageUrls,
      status: "pending"
    });

    const populatedReview = await review.populate("author", "name");
    return NextResponse.json({ review: populatedReview }, { status: 201 });
  } catch (error) {
    return createRouteErrorResponse(error, "Could not create review.");
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const payload = await request.json();
    const validation = validateReviewReplyPayload(payload);

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const permission = await canUserReplyToReview(session.user.id, validation.data.reviewId);

    if (!permission.allowed) {
      return NextResponse.json({ error: permission.reason }, { status: permission.reason === "Review not found." ? 404 : 403 });
    }

    await connectToDatabase();

    const review = await Review.findByIdAndUpdate(
      validation.data.reviewId,
      {
        $set: {
          providerReply: validation.data.providerReply,
          providerReplyAt: new Date(),
          providerReplyBy: session.user.id
        }
      },
      { new: true }
    )
      .populate("author", "name")
      .populate("providerReplyBy", "name");

    return NextResponse.json({ review });
  } catch (error) {
    return createRouteErrorResponse(error, "Could not update review.");
  }
}
