import { connectToDatabase } from "@/lib/db";
import Conversation from "@/models/Conversation";
import Lead from "@/models/Lead";
import Listing from "@/models/Listing";
import Place from "@/models/Place";
import Review from "@/models/Review";
import Story from "@/models/Story";
import User from "@/models/User";

export async function canUserReviewListing(userId: string, listingId: string) {
  await connectToDatabase();

  const listing = await Listing.findById(listingId).select("seller").lean();

  if (!listing) {
    return { allowed: false, reason: "Listing not found." } as const;
  }

  if (String(listing.seller) === userId) {
    return { allowed: false, reason: "You cannot review your own listing." } as const;
  }

  const [hasConversation, hasLead] = await Promise.all([
    Conversation.exists({ listing: listingId, participants: userId }),
    Lead.exists({ listingId, buyerId: userId })
  ]);

  if (!hasConversation && !hasLead) {
    return { allowed: false, reason: "A real interaction is required before reviewing this listing." } as const;
  }

  return { allowed: true, listing } as const;
}

export async function canUserReviewPlace(userId: string, placeId: string) {
  await connectToDatabase();

  const place = await Place.findById(placeId).select("createdBy").lean();

  if (!place) {
    return { allowed: false, reason: "Place not found." } as const;
  }

  if (String(place.createdBy) === userId) {
    return { allowed: false, reason: "You cannot review your own place." } as const;
  }

  const [savedPlace, story] = await Promise.all([
    User.exists({ _id: userId, savedPlaceIds: placeId }),
    Story.exists({ place: placeId, author: userId })
  ]);

  if (!savedPlace && !story) {
    return { allowed: false, reason: "A real interaction is required before reviewing this place." } as const;
  }

  return { allowed: true, place } as const;
}

export async function canUserReplyToReview(userId: string, reviewId: string) {
  await connectToDatabase();

  const review = await Review.findById(reviewId)
    .populate("listing", "seller")
    .populate("place", "createdBy")
    .select("listing place")
    .lean();

  if (!review) {
    return { allowed: false, reason: "Review not found." } as const;
  }

  const listingSellerId = typeof review.listing === "object" && review.listing ? String((review.listing as any).seller || "") : "";
  const placeOwnerId = typeof review.place === "object" && review.place ? String((review.place as any).createdBy || "") : "";

  if (listingSellerId === userId || placeOwnerId === userId) {
    return { allowed: true, review } as const;
  }

  return { allowed: false, reason: "Access denied." } as const;
}

