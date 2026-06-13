import { connectToDatabase } from "@/lib/db";
import Conversation from "@/models/Conversation";
import Lead from "@/models/Lead";
import Listing from "@/models/Listing";
import Review from "@/models/Review";
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

export async function canUserReplyToReview(userId: string, reviewId: string) {
  await connectToDatabase();

  const review = await Review.findById(reviewId)
    .populate("listing", "seller")
    .select("listing")
    .lean();

  if (!review) {
    return { allowed: false, reason: "Review not found." } as const;
  }

  const listingSellerId = typeof review.listing === "object" && review.listing ? String((review.listing as any).seller || "") : "";
  if (listingSellerId === userId) {
    return { allowed: true, review } as const;
  }

  return { allowed: false, reason: "Access denied." } as const;
}

