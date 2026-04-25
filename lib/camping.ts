import { serializeDocument } from "@/lib/utils";
import { connectToDatabase } from "@/lib/db";
import AgencyTrip from "@/models/AgencyTrip";
import Listing from "@/models/Listing";
import Place from "@/models/Place";
import Review from "@/models/Review";
import Story from "@/models/Story";
import TravelPost from "@/models/TravelPost";
import User from "@/models/User";

type PlaceFilters = {
  q?: string;
  city?: string;
  category?: string;
  bestSeason?: string;
  safety?: string;
  savedOnly?: boolean;
  userId?: string;
  includePending?: boolean;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseCoordinatesFromMapInput(value: unknown) {
  const raw = typeof value === "string" ? value.trim() : "";

  if (!raw) {
    return null;
  }

  const coordinateMatch =
    raw.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/) ||
    raw.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/) ||
    raw.match(/[?&](?:q|ll|query)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i);

  if (!coordinateMatch) {
    return null;
  }

  const lat = Number(coordinateMatch[1]);
  const lng = Number(coordinateMatch[2]);

  if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  return { lat, lng };
}

function buildPlaceSearchQuery(filters: PlaceFilters) {
  const query: Record<string, unknown> = {};

  if (!filters.includePending) {
    query.status = "approved";
  }

  if (filters.city?.trim()) {
    query.city = { $regex: escapeRegExp(filters.city.trim()), $options: "i" };
  }

  if (filters.category?.trim()) {
    query.category = { $regex: escapeRegExp(filters.category.trim()), $options: "i" };
  }

  if (filters.bestSeason?.trim()) {
    query.bestSeason = { $regex: escapeRegExp(filters.bestSeason.trim()), $options: "i" };
  }

  if (filters.safety?.trim()) {
    query.safety = { $regex: escapeRegExp(filters.safety.trim()), $options: "i" };
  }

  if (filters.q?.trim()) {
    const search = escapeRegExp(filters.q.trim());
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { city: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } }
    ];
  }

  if (filters.savedOnly && filters.userId) {
    query.savedBy = filters.userId;
  }

  return query;
}

function scorePlace(place: any) {
  const savedCount = Array.isArray(place.savedBy) ? place.savedBy.length : 0;
  const reviewCount = Number(place.reviewCount || 0);
  const ratingAverage = Number(place.ratingAverage || 0);
  return savedCount * 3 + reviewCount * 2 + ratingAverage;
}

export async function getPlaces(filters: PlaceFilters = {}) {
  await connectToDatabase();

  const places = await Place.find(buildPlaceSearchQuery(filters))
    .populate("createdBy", "name avatar")
    .sort({ createdAt: -1 })
    .lean();

  const placeIds = places.map((place) => place._id);
  const [reviews, stories] = await Promise.all([
    Review.find({
      place: { $in: placeIds },
      ...(filters.includePending ? {} : { status: "approved" })
    })
      .select("place rating")
      .lean(),
    Story.find({
      place: { $in: placeIds },
      ...(filters.includePending ? {} : { status: "approved" })
    })
      .select("place")
      .lean()
  ]);

  const reviewSummary = reviews.reduce<Record<string, { total: number; count: number }>>((acc, review: any) => {
    const placeId = String(review.place);
    acc[placeId] ??= { total: 0, count: 0 };
    acc[placeId].total += Number(review.rating || 0);
    acc[placeId].count += 1;
    return acc;
  }, {});

  const storySummary = stories.reduce<Record<string, number>>((acc, story: any) => {
    const placeId = String(story.place);
    acc[placeId] = (acc[placeId] || 0) + 1;
    return acc;
  }, {});

  return serializeDocument(
    places.map((place: any) => {
      const summary = reviewSummary[String(place._id)] || { total: 0, count: 0 };
      const savedCount = Array.isArray(place.savedBy) ? place.savedBy.length : 0;
      return {
        ...place,
        isSaved: filters.userId ? place.savedBy?.some((id: any) => String(id) === filters.userId) : false,
        savedCount,
        reviewCount: summary.count,
        ratingAverage: summary.count > 0 ? Number((summary.total / summary.count).toFixed(1)) : 0,
        storyCount: storySummary[String(place._id)] || 0
      };
    })
  ) as any[];
}

export async function getTrendingPlaces(limit = 6) {
  const places = await getPlaces();
  return places.sort((a: any, b: any) => scorePlace(b) - scorePlace(a)).slice(0, limit);
}

export async function getBestPlaces(limit = 6) {
  const places = await getPlaces();
  return places
    .filter((place: any) => Number(place.reviewCount || 0) > 0)
    .sort((a: any, b: any) => Number(b.ratingAverage || 0) - Number(a.ratingAverage || 0) || Number(b.reviewCount || 0) - Number(a.reviewCount || 0))
    .slice(0, limit);
}

export async function getPlaceById(placeId: string, userId?: string) {
  await connectToDatabase();

  const place = await Place.findById(placeId).populate("createdBy", "name avatar").lean();

  if (!place) {
    return null;
  }

  const [reviews, stories, trips, products, travelers] = await Promise.all([
    Review.find({ place: placeId, status: "approved" })
      .populate("author", "name avatar")
      .populate("providerReplyBy", "name")
      .sort({ createdAt: -1 })
      .lean(),
    Story.find({ place: placeId, status: "approved" }).populate("author", "name avatar").sort({ createdAt: -1 }).lean(),
    AgencyTrip.find({
      status: "active",
      $or: [
        { city: { $regex: escapeRegExp(place.city), $options: "i" } },
        { destination: { $regex: escapeRegExp(place.name), $options: "i" } },
        { destination: { $regex: escapeRegExp(place.city), $options: "i" } }
      ]
    })
      .populate("agency", "name city")
      .sort({ startDate: 1 })
      .limit(6)
      .lean(),
    Listing.find({
      status: "active",
      type: "sale",
      $or: [
        { location: { $regex: escapeRegExp(place.city), $options: "i" } },
        { category: { $regex: escapeRegExp(place.category), $options: "i" } },
        { description: { $regex: escapeRegExp(place.name), $options: "i" } }
      ]
    })
      .populate("seller", "name sellerVerificationStatus verified")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
    TravelPost.find({
      $or: [
        { destination: { $regex: escapeRegExp(place.name), $options: "i" } },
        { destination: { $regex: escapeRegExp(place.city), $options: "i" } }
      ]
    })
      .populate("userId", "name avatar")
      .sort({ date: 1, createdAt: -1 })
      .limit(8)
      .lean()
  ]);

  const reviewCount = reviews.length;
  const ratingAverage = reviewCount > 0 ? Number((reviews.reduce((sum: number, review: any) => sum + Number(review.rating || 0), 0) / reviewCount).toFixed(1)) : 0;
  const isSaved = userId ? Array.isArray(place.savedBy) && place.savedBy.some((id: any) => String(id) === userId) : false;

  return serializeDocument({
    ...place,
    isSaved,
    savedCount: Array.isArray(place.savedBy) ? place.savedBy.length : 0,
    reviewCount,
    ratingAverage,
    reviews,
    stories,
    trips,
    products,
    travelers
  }) as any;
}

export async function getSavedPlacesForUser(userId: string) {
  return getPlaces({ savedOnly: true, userId });
}

export async function toggleSavedPlace(userId: string, placeId: string) {
  await connectToDatabase();

  const user = await User.findById(userId).select("savedPlaceIds").lean();
  const alreadySaved = Boolean(user?.savedPlaceIds?.some((id: any) => String(id) === placeId));

  await Promise.all([
    User.updateOne(
      { _id: userId },
      alreadySaved ? { $pull: { savedPlaceIds: placeId } } : { $addToSet: { savedPlaceIds: placeId } }
    ),
    Place.updateOne(
      { _id: placeId },
      alreadySaved ? { $pull: { savedBy: userId } } : { $addToSet: { savedBy: userId } }
    )
  ]);

  const updatedPlace = await Place.findById(placeId).select("savedBy").lean();
  return {
    saved: !alreadySaved,
    savedCount: Array.isArray(updatedPlace?.savedBy) ? updatedPlace.savedBy.length : 0
  };
}
