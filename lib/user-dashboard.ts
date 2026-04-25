import { connectToDatabase } from "@/lib/db";
import { getSavedPlacesForUser } from "@/lib/camping";
import { serializeDocument } from "@/lib/utils";
import AgencyReservation from "@/models/AgencyReservation";
import RentalRequest from "@/models/RentalRequest";
import Review from "@/models/Review";

export async function getUserDashboardData(userId: string) {
  await connectToDatabase();

  const [reservations, rentalRequests, savedPlaces, reviews] = await Promise.all([
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
      .lean()
  ]);

  const normalizedReservations = serializeDocument(reservations) as any[];
  const normalizedRentalRequests = serializeDocument(rentalRequests) as any[];
  const normalizedSavedPlaces = serializeDocument(savedPlaces) as any[];
  const normalizedReviews = serializeDocument(reviews) as any[];

  return {
    reservations: normalizedReservations,
    rentalRequests: normalizedRentalRequests,
    savedPlaces: normalizedSavedPlaces,
    reviews: normalizedReviews,
    stats: {
      reservationsCount: normalizedReservations.length,
      rentalRequestsCount: normalizedRentalRequests.length,
      savedPlacesCount: normalizedSavedPlaces.length,
      reviewsCount: normalizedReviews.length
    }
  };
}
