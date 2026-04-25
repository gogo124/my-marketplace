import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { checkRateLimit, getRequestIdentity } from "@/lib/rate-limit";
import TravelPost from "@/models/TravelPost";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const rateLimit = checkRateLimit({
      key: `travel-post-interest:${session.user.id}:${getRequestIdentity(request, session.user.id)}`,
      limit: 20,
      windowMs: 15 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many interest actions. Please try again later." }, { status: 429 });
    }

    await connectToDatabase();

    const { id } = await context.params;
    const post = await TravelPost.findById(id).select("interestedUserIds").lean();

    if (!post) {
      return NextResponse.json({ error: "Travel post not found." }, { status: 404 });
    }

    const interested =
      Array.isArray(post.interestedUserIds) &&
      post.interestedUserIds.some((userId: any) => String(userId) === session.user.id);

    await TravelPost.updateOne(
      { _id: id },
      interested ? { $pull: { interestedUserIds: session.user.id } } : { $addToSet: { interestedUserIds: session.user.id } }
    );

    const updatedPost = await TravelPost.findById(id).select("interestedUserIds").lean();

    return NextResponse.json({
      interested: !interested,
      interestedCount: Array.isArray(updatedPost?.interestedUserIds) ? updatedPost.interestedUserIds.length : 0
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update interest.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
