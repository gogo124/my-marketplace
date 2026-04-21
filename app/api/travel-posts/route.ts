import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import TravelPost from "@/models/TravelPost";

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const destination = searchParams.get("destination")?.trim();
    const date = searchParams.get("date");
    const query: Record<string, unknown> = {};

    if (destination) {
      query.destination = { $regex: destination, $options: "i" };
    }

    if (date) {
      const start = new Date(date);

      if (!Number.isNaN(start.getTime())) {
        const end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 1);
        query.date = { $gte: start, $lt: end };
      }
    }

    const posts = await TravelPost.find(query)
      .populate("userId", "name email avatar")
      .sort({ createdAt: -1 });

    return NextResponse.json({ posts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not fetch travel posts.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { destination, date, description, phoneNumber } = await request.json();

    if (!destination || !date || !description || !phoneNumber) {
      return NextResponse.json({ error: "Invalid travel post payload." }, { status: 400 });
    }

    await connectToDatabase();

    const post = await TravelPost.create({
      userId: session.user.id,
      destination: String(destination).trim(),
      date: new Date(String(date)),
      description: String(description).trim(),
      phoneNumber: String(phoneNumber).trim()
    });

    const populatedPost = await post.populate("userId", "name email avatar");

    return NextResponse.json({ post: populatedPost }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create travel post.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
