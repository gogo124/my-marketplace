import { connectToDatabase } from "@/lib/db";
import { getConversationsForUser } from "@/lib/data";
import { getSavedPlacesForUser } from "@/lib/camping";
import { getSellerAccessSnapshot } from "@/lib/seller";
import { serializeDocument } from "@/lib/utils";
import AgencyReservation from "@/models/AgencyReservation";
import RentalRequest from "@/models/RentalRequest";
import TravelPost from "@/models/TravelPost";
import Review from "@/models/Review";
import User from "@/models/User";
import Listing from "@/models/Listing";

export async function getUserDashboardData(userId: string) {
  await connectToDatabase();

  const [profile, reservations, rentalRequests, savedPlaces, reviews, conversations, travelPostsCount, listingsCount] = await Promise.all([
    User.findById(userId)
      .select(
        "name email avatar role createdAt sellerVerificationStatus verified canCreateAgency canCreateRenter savedPlaceIds sellerStatus sellerPlan sellerExpiresAt sellerRequestedAt sellerApprovedAt sellerProfile"
      )
      .lean(),
    AgencyReservation.find({ user: userId })
      .populate("trip", "title destination startDate endDate tripCode")
      .populate("agency", "name city")
      .sort({ createdAt: -1 })
      .lean(),
    RentalRequest.find({ user: userId })
      .populate("trip", "title city tripCode")
      .populate("agency", "name city")
      .populate("rentalItem", "title itemType")
      .sort({ createdAt: -1 })
      .lean(),
    getSavedPlacesForUser(userId),
    Review.find({ author: userId })
      .populate("listing", "title")
      .populate("place", "name city")
      .sort({ createdAt: -1 })
      .lean(),
    getConversationsForUser(userId),
    TravelPost.countDocuments({ userId }),
    Listing.countDocuments({ seller: userId })
  ]);

  const normalizedReservations = serializeDocument(reservations) as any[];
  const normalizedRentalRequests = serializeDocument(rentalRequests) as any[];
  const normalizedSavedPlaces = serializeDocument(savedPlaces) as any[];
  const normalizedReviews = serializeDocument(reviews) as any[];
  const normalizedConversations = conversations as any[];
  const unreadMessagesCount = normalizedConversations.reduce((sum: number, conversation: any) => sum + Number(conversation.unreadCount || 0), 0);
  const upcomingReservations = [...normalizedReservations]
    .filter((reservation: any) => reservation.preferredDate || reservation.trip?.startDate)
    .sort((left: any, right: any) => {
      const leftDate = new Date(left.preferredDate || left.trip?.startDate || 0).getTime();
      const rightDate = new Date(right.preferredDate || right.trip?.startDate || 0).getTime();
      return leftDate - rightDate;
    })
    .slice(0, 6);
  const tripCodesCount = normalizedReservations.filter((reservation: any) => Boolean(reservation.trip?.tripCode)).length;
  const profileCompletion = profile
    ? Math.min(
        100,
        Math.round(
          [
            profile.name,
            profile.email,
            profile.avatar,
            profile.role
          ].filter(Boolean).length * 25
        )
      )
    : 0;

  return {
    user: profile ? (serializeDocument(profile) as any) : null,
    sellerAccess: getSellerAccessSnapshot(profile as any),
    reservations: normalizedReservations,
    rentalRequests: normalizedRentalRequests,
    savedPlaces: normalizedSavedPlaces,
    reviews: normalizedReviews,
    conversations: normalizedConversations,
    upcomingReservations,
    stats: {
      reservationsCount: normalizedReservations.length,
      rentalRequestsCount: normalizedRentalRequests.length,
      savedPlacesCount: normalizedSavedPlaces.length,
      reviewsCount: normalizedReviews.length,
      messagesCount: normalizedConversations.length,
      unreadMessagesCount,
      travelPostsCount,
      tripCodesCount,
      profileCompletion,
      listingsCount
    }
  };
}
