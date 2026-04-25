import { connectToDatabase } from "@/lib/db";
import Listing from "@/models/Listing";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import Review from "@/models/Review";
import { serializeDocument } from "@/lib/utils";

type ListingFilters = {
  q?: string;
  type?: string;
  location?: string;
  category?: string;
};

export async function getListings(filters: ListingFilters = {}) {
  await connectToDatabase();

  const query: Record<string, unknown> = { status: "active" };
  const search = typeof filters.q === "string" ? filters.q.trim() : "";
  const type = filters.type === "sale" || filters.type === "rental" ? filters.type : "";
  const location = typeof filters.location === "string" ? filters.location.trim() : "";
  const category = typeof filters.category === "string" ? filters.category.trim() : "";

  if (type) {
    query.type = type;
  }

  if (location) {
    query.location = { $regex: location, $options: "i" };
  }

  if (category) {
    query.category = { $regex: category, $options: "i" };
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } }
    ];
  }

  const listings = await Listing.find(query)
    .populate("seller", "name email avatar sellerVerificationStatus verified")
    .sort({ createdAt: -1 })
    .lean();

  return serializeDocument(listings);
}

export async function getListingById(id: string) {
  await connectToDatabase();

  const listing = await Listing.findById(id)
    .populate("seller", "name email avatar sellerVerificationStatus verified")
    .lean();
  return listing ? serializeDocument(listing) : null;
}

export async function getReviewsForListing(listingId: string) {
  await connectToDatabase();

  const reviews = await Review.find({ listing: listingId, status: "approved" })
    .populate("author", "name")
    .populate("providerReplyBy", "name")
    .sort({ createdAt: -1 })
    .lean();

  return serializeDocument(reviews);
}

export async function getConversationsForUser(userId: string) {
  await connectToDatabase();

  const conversations = await Conversation.find({ participants: userId })
    .populate("listing", "title price images")
    .populate("participants", "name email avatar")
    .sort({ lastMessageAt: -1 })
    .lean();

  return serializeDocument(conversations);
}

export async function getMessagesForConversation(conversationId: string) {
  await connectToDatabase();

  const messages = await Message.find({ conversation: conversationId })
    .populate("sender", "name email avatar")
    .sort({ createdAt: 1 })
    .lean();

  return serializeDocument(messages);
}
