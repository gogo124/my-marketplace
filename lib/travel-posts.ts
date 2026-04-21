import { connectToDatabase } from "@/lib/db";
import { serializeDocument } from "@/lib/utils";
import TravelPost from "@/models/TravelPost";

type TravelPostFilters = {
  destination?: string;
  date?: string;
};

export async function getTravelPosts(filters: TravelPostFilters = {}) {
  await connectToDatabase();

  const query: Record<string, unknown> = {};

  if (filters.destination?.trim()) {
    query.destination = { $regex: filters.destination.trim(), $options: "i" };
  }

  if (filters.date) {
    const start = new Date(filters.date);

    if (!Number.isNaN(start.getTime())) {
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);
      query.date = { $gte: start, $lt: end };
    }
  }

  const posts = await TravelPost.find(query)
    .populate("userId", "name email avatar")
    .sort({ createdAt: -1 })
    .lean();

  return serializeDocument(posts);
}
