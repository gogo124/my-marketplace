import AgencyProfile from "@/models/AgencyProfile";
import AgencyReservation from "@/models/AgencyReservation";
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
import Story from "@/models/Story";
import TravelPost from "@/models/TravelPost";
import User from "@/models/User";
import { deleteUploadedFiles } from "@/lib/uploads";

export async function deleteListingByAdmin(listingId: string) {
  const listing = await Listing.findById(listingId).select("images").lean();

  if (!listing) {
    return null;
  }

  const conversations = await Conversation.find({ listing: listingId }).select("_id").lean();
  const conversationIds = conversations.map((conversation) => conversation._id);
  const reviewIds = await Review.find({ listing: listingId }).distinct("_id");

  await Promise.all([
    deleteUploadedFiles(Array.isArray(listing.images) ? listing.images : []),
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
    deleteUploadedFiles([post.profileImage]),
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
    deleteUploadedFiles([review.image]),
    Report.deleteMany({ targetType: "review", targetId: reviewId })
  ]);
  return review;
}

export async function deletePlaceByAdmin(placeId: string) {
  const place = await Place.findById(placeId).select("images").lean();

  if (!place) {
    return null;
  }

  const [reviewIds, storyIds] = await Promise.all([
    Review.find({ place: placeId }).distinct("_id"),
    Story.find({ place: placeId }).distinct("_id")
  ]);

  const storyImages = await Story.find({ place: placeId }).distinct("image");
  const reviewImages = await Review.find({ place: placeId }).distinct("image");

  await Promise.all([
    deleteUploadedFiles([
      ...(Array.isArray(place.images) ? place.images : []),
      ...storyImages,
      ...reviewImages
    ]),
    Place.deleteOne({ _id: placeId }),
    Review.deleteMany({ place: placeId }),
    Story.deleteMany({ place: placeId }),
    User.updateMany({ savedPlaceIds: placeId }, { $pull: { savedPlaceIds: placeId } }),
    Report.deleteMany({
      $or: [
        { targetType: "place", targetId: placeId },
        ...(reviewIds.length > 0 ? [{ targetType: "review", targetId: { $in: reviewIds } }] : []),
        ...(storyIds.length > 0 ? [{ targetType: "story", targetId: { $in: storyIds } }] : [])
      ]
    })
  ]);

  return place;
}

export async function deleteStoryByAdmin(storyId: string) {
  const story = await Story.findByIdAndDelete(storyId).select("_id image").lean();

  if (!story) {
    return null;
  }

  await Promise.all([
    deleteUploadedFiles([story.image]),
    Report.deleteMany({ targetType: "story", targetId: storyId })
  ]);

  return story;
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

export async function deleteReservationByAdmin(reservationId: string) {
  const reservation = await AgencyReservation.findByIdAndDelete(reservationId).select("trip seats").lean();

  if (reservation?.trip && Number(reservation.seats || 0) > 0) {
    await AgencyTrip.findByIdAndUpdate(reservation.trip, {
      $inc: { seatsBooked: -Number(reservation.seats || 0) }
    });
  }

  return reservation;
}

export async function deleteAgencyByAdmin(agencyId: string) {
  const agency = await AgencyProfile.findById(agencyId).select("logo coverImage").lean();

  if (!agency) {
    return null;
  }

  const trips = await AgencyTrip.find({ agency: agencyId }).select("_id").lean();
  const tripIds = trips.map((trip) => trip._id);

  await Promise.all([
    deleteUploadedFiles([agency.logo, agency.coverImage]),
    AgencyProfile.deleteOne({ _id: agencyId }),
    AgencyTrip.deleteMany({ agency: agencyId }),
    AgencyReservation.deleteMany({
      $or: [
        { agency: agencyId },
        ...(tripIds.length > 0 ? [{ trip: { $in: tripIds } }] : [])
      ]
    }),
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
  const places = await Place.find({ createdBy: userId }).select("_id images").lean();
  const renterItems = await RentalItem.find({ owner: userId }).select("_id images").lean();
  const listingIds = listings.map((listing) => listing._id);
  const placeIds = places.map((place) => place._id);
  const travelPostIds = await TravelPost.find({ userId }).distinct("_id");
  const reviewIds = await Review.find({ author: userId }).distinct("_id");
  const storyIds = await Story.find({ author: userId }).distinct("_id");
  const conversations = await Conversation.find({ participants: userId }).select("_id listing").lean();
  const conversationIds = conversations.map((conversation) => conversation._id);

  await Promise.all([
    deleteUploadedFiles([
      user.avatar,
      ...(agency ? [agency.logo, agency.coverImage] : []),
      ...(renter ? [renter.logo, renter.coverImage] : []),
      ...renterItems.flatMap((item: any) => (Array.isArray(item.images) ? item.images : [])),
      ...listings.flatMap((listing: any) => (Array.isArray(listing.images) ? listing.images : [])),
      ...places.flatMap((place: any) => (Array.isArray(place.images) ? place.images : [])),
      ...(await TravelPost.find({ userId }).distinct("profileImage"))
    ]),
    User.deleteOne({ _id: userId }),
    agency ? AgencyProfile.deleteOne({ _id: agency._id }) : Promise.resolve(),
    agency ? AgencyTrip.deleteMany({ agency: agency._id }) : Promise.resolve(),
    renter ? RenterProfile.deleteOne({ _id: renter._id }) : Promise.resolve(),
    renter ? RentalItem.deleteMany({ renter: renter._id }) : Promise.resolve(),
    renter ? AgencyTrip.updateMany({ renterPartners: renter._id }, { $pull: { renterPartners: renter._id } }) : Promise.resolve(),
    agency ? AgencyReservation.deleteMany({ agency: agency._id }) : Promise.resolve(),
    Listing.deleteMany({ seller: userId }),
    Place.deleteMany({ createdBy: userId }),
    TravelPost.deleteMany({ userId }),
    Review.deleteMany({ author: userId }),
    Story.deleteMany({ author: userId }),
    placeIds.length > 0 ? Review.deleteMany({ place: { $in: placeIds } }) : Promise.resolve(),
    placeIds.length > 0 ? Story.deleteMany({ place: { $in: placeIds } }) : Promise.resolve(),
    Place.updateMany({ savedBy: userId }, { $pull: { savedBy: userId } }),
    Lead.deleteMany({ $or: [{ sellerId: userId }, { buyerId: userId }] }),
    AgencyReservation.deleteMany({ user: userId }),
    Report.deleteMany({
      $or: [
        { reporterId: userId },
        { targetType: "user", targetId: userId },
        ...(agency ? [{ targetType: "agency", targetId: agency._id }] : []),
        ...(listingIds.length > 0 ? [{ targetType: "listing", targetId: { $in: listingIds } }] : []),
        ...(placeIds.length > 0 ? [{ targetType: "place", targetId: { $in: placeIds } }] : []),
        ...(travelPostIds.length > 0 ? [{ targetType: "travel-post", targetId: { $in: travelPostIds } }] : []),
        ...(reviewIds.length > 0 ? [{ targetType: "review", targetId: { $in: reviewIds } }] : []),
        ...(storyIds.length > 0 ? [{ targetType: "story", targetId: { $in: storyIds } }] : [])
      ]
    }),
    conversationIds.length > 0 ? Message.deleteMany({ conversation: { $in: conversationIds } }) : Promise.resolve(),
    Conversation.deleteMany({ participants: userId })
  ]);

  return user;
}
