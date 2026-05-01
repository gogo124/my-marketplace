import { connectToDatabase } from "@/lib/db";
import { withMemoryCache } from "@/lib/simple-cache";
import { serializeDocument } from "@/lib/utils";
import TravelPost from "@/models/TravelPost";

type TravelPostFilters = {
  destination?: string;
  city?: string;
  date?: string;
  gender?: string;
  userId?: string;
  limit?: number;
  page?: number;
  pageSize?: number;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildTravelPostQuery(filters: TravelPostFilters = {}) {
  const query: Record<string, unknown> = {};

  if (filters.destination?.trim()) {
    query.destination = { $regex: escapeRegExp(filters.destination.trim()), $options: "i" };
  }

  if (filters.city?.trim()) {
    query.city = { $regex: escapeRegExp(filters.city.trim()), $options: "i" };
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

  return query;
}

function normalizeTravelPosts(posts: any[], filters: TravelPostFilters) {
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
  const query = buildTravelPostQuery(filters);
  const postsQuery = TravelPost.find(query)
    .select("destination city date description phoneNumber gender profileImage coverImage interestedUserIds userId createdAt")
    .populate("userId", "name email avatar sellerVerificationStatus verified")
    .sort({ createdAt: -1 });

  if (typeof filters.limit === "number" && filters.limit > 0) {
    postsQuery.limit(filters.limit);
  }

  const posts = await postsQuery.lean();
  return normalizeTravelPosts(posts, filters);
}

export async function getTravelPostsPage(filters: TravelPostFilters = {}) {
  await connectToDatabase();

  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = Math.min(24, Math.max(1, Number(filters.pageSize) || Number(filters.limit) || 12));
  const query = buildTravelPostQuery(filters);

  const loadPage = async () => {
    const [posts, total] = await Promise.all([
      TravelPost.find(query)
        .select("destination city date description phoneNumber gender profileImage coverImage interestedUserIds userId createdAt")
        .populate("userId", "name email avatar sellerVerificationStatus verified")
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      TravelPost.countDocuments(query)
    ]);

    return {
      posts: normalizeTravelPosts(posts, filters),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        hasNextPage: page * pageSize < total,
        hasPreviousPage: page > 1
      }
    };
  };

  if (filters.userId) {
    return loadPage();
  }

  const cacheKey = `travel-posts:${JSON.stringify({ ...query, page, pageSize })}`;
  return withMemoryCache(cacheKey, 30_000, loadPage);
}
