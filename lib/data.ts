import { connectToDatabase } from "@/lib/db";
import Listing from "@/models/Listing";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import Review from "@/models/Review";
import { serializeDocument } from "@/lib/utils";

export async function getListings() {
  await connectToDatabase();

  const listings = await Listing.find({ status: "active" })
    .populate("seller", "name email avatar")
    .sort({ createdAt: -1 })
    .lean();

  return serializeDocument(listings);
}

export async function getListingById(id: string) {
  await connectToDatabase();

  const listing = await Listing.findById(id).populate("seller", "name email avatar").lean();
  return listing ? serializeDocument(listing) : null;
}

export async function getReviewsForListing(listingId: string) {
  await connectToDatabase();

  const reviews = await Review.find({ listing: listingId })
    .populate("author", "name")
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
