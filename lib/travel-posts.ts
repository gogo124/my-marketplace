import { connectToDatabase } from "@/lib/db";
import { serializeDocument } from "@/lib/utils";
import TravelPost from "@/models/TravelPost";

type TravelPostFilters = {
  destination?: string;
  city?: string;
  date?: string;
  gender?: string;
  userId?: string;
  limit?: number;
};

function getTravelPostProfileCompleteness(post: any) {
  const checklist = [
    Boolean(String(post.destination || "").trim()),
    Boolean(String(post.city || "").trim()),
    Boolean(post.date),
    Boolean(String(post.phoneNumber || "").trim()),
    Boolean(String(post.description || "").trim() && String(post.description || "").trim().length >= 20),
    Boolean(String(post.profileImage || "").trim()),
    Boolean(String(post.coverImage || "").trim())
  ];

  const completed = checklist.filter(Boolean).length;
  return Math.round((completed / checklist.length) * 100);
}

export async function getTravelPosts(filters: TravelPostFilters = {}) {
  await connectToDatabase();

  const query: Record<string, unknown> = {};

  if (filters.destination?.trim()) {
    query.destination = { $regex: filters.destination.trim(), $options: "i" };
  }

  if (filters.city?.trim()) {
    query.city = { $regex: filters.city.trim(), $options: "i" };
  }

  if (filters.date) {
    const start = new Date(filters.date);

    if (!Number.isNaN(start.getTime())) {
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);
      query.date = { $gte: start, $lt: end };
    }
  }

  if (filters.gender === "male" || filters.gender === "female") {
    query.gender = filters.gender;
  }

  const postsQuery = TravelPost.find(query)
    .populate("userId", "name email avatar sellerVerificationStatus verified")
    .sort({ createdAt: -1 });

  if (typeof filters.limit === "number" && filters.limit > 0) {
    postsQuery.limit(filters.limit);
  }

  const posts = await postsQuery.lean();

  return serializeDocument(
    posts.map((post: any) => ({
      ...post,
      interestedCount: Array.isArray(post.interestedUserIds) ? post.interestedUserIds.length : 0,
      profileCompleteness: getTravelPostProfileCompleteness(post),
      hasVerifiedAccount: Boolean(post.userId?.sellerVerificationStatus === "verified" || post.userId?.verified),
      hasPhoneContact: Boolean(String(post.phoneNumber || "").trim()),
      isInterested: filters.userId
        ? Array.isArray(post.interestedUserIds) && post.interestedUserIds.some((id: any) => String(id) === filters.userId)
        : false
    }))
  );
}
