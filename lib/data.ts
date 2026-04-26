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
  limit?: number;
  page?: number;
  pageSize?: number;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildListingQuery(filters: ListingFilters = {}) {
  const query: Record<string, unknown> = { status: "active" };
  const search = typeof filters.q === "string" ? filters.q.trim() : "";
  const type = filters.type === "sale" || filters.type === "rental" ? filters.type : "";
  const location = typeof filters.location === "string" ? filters.location.trim() : "";
  const category = typeof filters.category === "string" ? filters.category.trim() : "";

  if (type) {
    query.type = type;
  }

  if (location) {
    query.location = { $regex: escapeRegExp(location), $options: "i" };
  }

  if (category) {
    query.category = { $regex: escapeRegExp(category), $options: "i" };
  }

  if (search) {
    const safeSearch = escapeRegExp(search);
    query.$or = [
      { title: { $regex: safeSearch, $options: "i" } },
      { description: { $regex: safeSearch, $options: "i" } },
      { location: { $regex: safeSearch, $options: "i" } },
      { category: { $regex: safeSearch, $options: "i" } }
    ];
  }

  return query;
}

export async function getListings(filters: ListingFilters = {}) {
  await connectToDatabase();

  const query = buildListingQuery(filters);

  const listingQuery = Listing.find(query)
    .select(
      "title description price type category location phoneNumber whatsappNumber startDate endDate deposit images seller status createdAt"
    )
    .populate("seller", "name email avatar sellerVerificationStatus verified")
    .sort({ createdAt: -1 });

  if (typeof filters.limit === "number" && filters.limit > 0) {
    listingQuery.limit(filters.limit);
  }

  const listings = await listingQuery.lean();

  return serializeDocument(listings);
}

export async function getListingsPage(filters: ListingFilters = {}) {
  await connectToDatabase();

  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = Math.min(24, Math.max(1, Number(filters.pageSize) || Number(filters.limit) || 12));
  const query = buildListingQuery(filters);
  const [listings, total] = await Promise.all([
    Listing.find(query)
      .select(
        "title description price type category location phoneNumber whatsappNumber startDate endDate deposit images seller status createdAt"
      )
      .populate("seller", "name email avatar sellerVerificationStatus verified")
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Listing.countDocuments(query)
  ]);

  return {
    listings: serializeDocument(listings),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      hasNextPage: page * pageSize < total,
      hasPreviousPage: page > 1
    }
  };
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

  const normalizedConversations = serializeDocument(conversations) as any[];
  const enrichedConversations = await Promise.all(
    normalizedConversations.map(async (conversation) => {
      const lastMessage = await Message.findOne({ conversation: conversation._id })
        .populate("sender", "name email avatar")
        .sort({ createdAt: -1 })
        .lean();
      const normalizedLastMessage = lastMessage ? (serializeDocument(lastMessage) as any) : null;
      const readState = Array.isArray(conversation.readState) ? conversation.readState : [];
      const lastReadEntry = readState.find((entry: any) => String(entry.user?._id || entry.user) === String(userId));
      const lastReadAt = lastReadEntry?.lastReadAt ? new Date(lastReadEntry.lastReadAt) : null;
      const unreadQuery: Record<string, unknown> = {
        conversation: conversation._id,
        sender: { $ne: userId }
      };

      if (lastReadAt) {
        unreadQuery.createdAt = { $gt: lastReadAt };
      }

      const unreadCount = await Message.countDocuments(unreadQuery);

      return {
        ...conversation,
        lastMessage: normalizedLastMessage,
        unreadCount
      };
    })
  );

  return enrichedConversations;
}

export async function getMessagesForConversation(conversationId: string) {
  await connectToDatabase();

  const messages = await Message.find({ conversation: conversationId })
    .populate("sender", "name email avatar")
    .sort({ createdAt: 1 })
    .lean();

  return serializeDocument(messages);
}
