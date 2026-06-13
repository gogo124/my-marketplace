import AgencyProfile from "@/models/AgencyProfile";
import AgencyTrip from "@/models/AgencyTrip";
import Conversation from "@/models/Conversation";
import Lead from "@/models/Lead";
import Listing from "@/models/Listing";
import Message from "@/models/Message";
import Place from "@/models/Place";
import Report from "@/models/Report";
import RentalItem from "@/models/RentalItem";
import RenterProfile from "@/models/RenterProfile";
import Review from "@/models/Review";
import TravelPost from "@/models/TravelPost";
import User from "@/models/User";

export async function deleteListingByAdmin(listingId: string) {
  const listing = await Listing.findById(listingId).select("images").lean();

  if (!listing) {
    return null;
  }

  const conversations = await Conversation.find({ listing: listingId }).select("_id").lean();
  const conversationIds = conversations.map((conversation) => conversation._id);
  const reviewIds = await Review.find({ listing: listingId }).distinct("_id");

  await Promise.all([
    Listing.deleteOne({ _id: listingId }),
    Review.deleteMany({ listing: listingId }),
    Lead.deleteMany({ listingId }),
    Report.deleteMany({
      $or: [
        { targetType: "listing", targetId: listingId },
        ...(reviewIds.length > 0 ? [{ targetType: "review", targetId: { $in: reviewIds } }] : [])
      ]
    }),
    conversationIds.length > 0 ? Message.deleteMany({ conversation: { $in: conversationIds } }) : Promise.resolve(),
    Conversation.deleteMany({ listing: listingId })
  ]);

  return listing;
}

export async function deleteTravelPostByAdmin(postId: string) {
  const post = await TravelPost.findByIdAndDelete(postId).select("_id profileImage").lean();

  if (!post) {
    return null;
  }

  await Promise.all([
    Report.deleteMany({ targetType: "travel-post", targetId: postId })
  ]);
  return post;
}

export async function deleteReviewByAdmin(reviewId: string) {
  const review = await Review.findByIdAndDelete(reviewId).select("_id image").lean();

  if (!review) {
    return null;
  }

  await Promise.all([
    Report.deleteMany({ targetType: "review", targetId: reviewId })
  ]);
  return review;
}

export async function deleteMessageByAdmin(messageId: string) {
  const message = await Message.findByIdAndDelete(messageId).select("_id").lean();

  if (!message) {
    return null;
  }

  return message;
}

export async function deleteLeadByAdmin(leadId: string) {
  const lead = await Lead.findByIdAndDelete(leadId).select("_id").lean();
  return lead;
}


export async function deleteAgencyByAdmin(agencyId: string) {
  const agency = await AgencyProfile.findById(agencyId).select("logo coverImage").lean();

  if (!agency) {
    return null;
  }

  const trips = await AgencyTrip.find({ agency: agencyId }).select("_id").lean();
  const tripIds = trips.map((trip) => trip._id);

  await Promise.all([
    AgencyProfile.deleteOne({ _id: agencyId }),
    AgencyTrip.deleteMany({ agency: agencyId }),
    Promise.resolve(),
    Report.deleteMany({ targetType: "agency", targetId: agencyId })
  ]);

  return agency;
}

export async function deleteReportByAdmin(reportId: string) {
  const report = await Report.findByIdAndDelete(reportId).select("_id").lean();
  return report;
}

export async function deleteUserByAdmin(userId: string) {
  const user = await User.findById(userId).select("avatar").lean();

  if (!user) {
    return null;
  }

  const agency = await AgencyProfile.findOne({ user: userId }).select("_id logo coverImage").lean();
  const renter = await RenterProfile.findOne({ user: userId }).select("_id logo coverImage").lean();
  const listings = await Listing.find({ seller: userId }).select("_id images").lean();
  const renterItems = await RentalItem.find({ owner: userId }).select("_id images").lean();
  const listingIds = listings.map((listing) => listing._id);
  const travelPostIds = await TravelPost.find({ userId }).distinct("_id");
  const reviewIds = await Review.find({ author: userId }).distinct("_id");
  const conversations = await Conversation.find({ participants: userId }).select("_id listing").lean();
  const conversationIds = conversations.map((conversation) => conversation._id);

  await Promise.all([
    User.deleteOne({ _id: userId }),
    agency ? AgencyProfile.deleteOne({ _id: agency._id }) : Promise.resolve(),
    agency ? AgencyTrip.deleteMany({ agency: agency._id }) : Promise.resolve(),
    renter ? RenterProfile.deleteOne({ _id: renter._id }) : Promise.resolve(),
    renter ? RentalItem.deleteMany({ renter: renter._id }) : Promise.resolve(),
    renter ? AgencyTrip.updateMany({ renterPartners: renter._id }, { $pull: { renterPartners: renter._id } }) : Promise.resolve(),
    agency ? Promise.resolve() : Promise.resolve(),
    Listing.deleteMany({ seller: userId }),
    TravelPost.deleteMany({ userId }),
    Review.deleteMany({ author: userId }),
    Lead.deleteMany({ $or: [{ sellerId: userId }, { buyerId: userId }] }),
    Promise.resolve(),
    Report.deleteMany({
      $or: [
        { reporterId: userId },
        { targetType: "user", targetId: userId },
        ...(agency ? [{ targetType: "agency", targetId: agency._id }] : []),
        ...(listingIds.length > 0 ? [{ targetType: "listing", targetId: { $in: listingIds } }] : []),
        ...(travelPostIds.length > 0 ? [{ targetType: "travel-post", targetId: { $in: travelPostIds } }] : []),
        ...(reviewIds.length > 0 ? [{ targetType: "review", targetId: { $in: reviewIds } }] : []),
      ]
    }),
    conversationIds.length > 0 ? Message.deleteMany({ conversation: { $in: conversationIds } }) : Promise.resolve(),
    Conversation.deleteMany({ participants: userId })
  ]);

  return user;
}
