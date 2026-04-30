import { connectToDatabase } from "@/lib/db";
import { getSellerAccessSnapshot } from "@/lib/seller";
import { serializeDocument } from "@/lib/utils";
import Conversation from "@/models/Conversation";
import Lead from "@/models/Lead";
import Listing from "@/models/Listing";
import Message from "@/models/Message";
import User from "@/models/User";

export async function getSellerDashboardData(userId: string) {
  await connectToDatabase();

  const seller = await User.findById(userId)
    .select(
      "name email avatar sellerVerificationStatus verified accountStatus createdAt sellerStatus sellerPlan sellerExpiresAt sellerRequestedAt sellerApprovedAt sellerProfile"
    )
    .lean();

  const listings = await Listing.find({ seller: userId })
    .populate("seller", "name email avatar sellerVerificationStatus verified")
    .sort({ createdAt: -1 })
    .lean();

  const normalizedListings = serializeDocument(listings) as any[];
  const listingIds = normalizedListings.map((listing) => listing._id);

  const [leads, conversations] = await Promise.all([
    Lead.find({ sellerId: userId })
      .populate("listingId", "title price images location type status")
      .populate("buyerId", "name email avatar")
      .sort({ createdAt: -1 })
      .limit(30)
      .lean(),
    listingIds.length > 0
      ? Conversation.find({ listing: { $in: listingIds } })
          .populate("listing", "title price images location type")
          .populate("participants", "name email avatar")
          .sort({ lastMessageAt: -1 })
          .limit(12)
          .lean()
      : Promise.resolve([])
  ]);

  const normalizedLeads = serializeDocument(leads) as any[];
  const marketplaceLeads = normalizedLeads.filter((lead: any) => !lead.isExternalOrder);
  const externalOrders = normalizedLeads.filter((lead: any) => lead.isExternalOrder);
  const normalizedConversations = serializeDocument(conversations) as any[];
  const conversationIds = normalizedConversations.map((conversation) => conversation._id);
  const recentMessages = conversationIds.length
    ? await Message.find({ conversation: { $in: conversationIds } })
        .populate("sender", "name email avatar")
        .populate({
          path: "conversation",
          populate: { path: "listing", select: "title price images location" },
          select: "listing"
        })
        .sort({ createdAt: -1 })
        .limit(12)
        .lean()
    : [];
  const normalizedRecentMessages = serializeDocument(recentMessages) as any[];

  return {
    seller: seller ? (serializeDocument(seller) as any) : null,
    sellerAccess: getSellerAccessSnapshot(seller as any),
    listings: normalizedListings,
    leads: normalizedLeads,
    marketplaceLeads,
    externalOrders,
    conversations: normalizedConversations,
    recentMessages: normalizedRecentMessages,
    stats: {
      listingsCount: normalizedListings.length,
      activeListingsCount: normalizedListings.filter((listing: any) => listing.status === "active").length,
      inactiveListingsCount: normalizedListings.filter((listing: any) => listing.status !== "active").length,
      leadCount: normalizedLeads.length,
      marketplaceLeadCount: marketplaceLeads.length,
      externalOrderCount: externalOrders.length,
      newLeadCount: normalizedLeads.filter((lead: any) => lead.status === "new").length,
      contactedLeadCount: normalizedLeads.filter((lead: any) => lead.status === "contacted").length,
      closedLeadCount: normalizedLeads.filter((lead: any) => ["closed", "sold", "cancelled"].includes(lead.status)).length,
      conversationCount: normalizedConversations.length,
      messageCount: normalizedRecentMessages.length,
      verifiedSellerCount: seller ? Number(Boolean((seller as any).sellerVerificationStatus === "verified" || (seller as any).verified)) : 0
    }
  };
}
