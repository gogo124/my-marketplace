import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getSubmittedImageUrls, validateSubmittedImageUrls } from "@/lib/image-upload";
import { checkRateLimit, getRequestIdentity } from "@/lib/rate-limit";
import { validateTravelPostPayload } from "@/lib/validation";
import TravelPost from "@/models/TravelPost";

export const runtime = "nodejs";

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

    const rateLimit = checkRateLimit({
      key: `travel-post:${session.user.id}:${getRequestIdentity(request, session.user.id)}`,
      limit: 5,
      windowMs: 60 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many travel post attempts. Please try again later." }, { status: 429 });
    }

    const formData = await request.formData();
    const profileImages = getSubmittedImageUrls(formData, "profileImage");
    const coverImages = getSubmittedImageUrls(formData, "coverImage");
    const payload = {
      destination: formData.get("destination"),
      date: formData.get("date"),
      description: formData.get("description"),
      phoneNumber: formData.get("phoneNumber"),
      gender: formData.get("gender")
    };
    const validation = validateTravelPostPayload(payload);

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const imageValidationError = validateSubmittedImageUrls({
      urls: profileImages,
      maxFiles: 1,
      label: "profile image"
    });

    if (imageValidationError) {
      return NextResponse.json({ error: imageValidationError }, { status: 400 });
    }

    const coverImageValidationError = validateSubmittedImageUrls({
      urls: coverImages,
      maxFiles: 1,
      label: "trip image"
    });

    if (coverImageValidationError) {
      return NextResponse.json({ error: coverImageValidationError }, { status: 400 });
    }

    await connectToDatabase();

    const duplicateWindowStart = new Date(Date.now() - 60 * 60 * 1000);
    const duplicatePost = await TravelPost.findOne({
      userId: session.user.id,
      destination: validation.data.destination,
      date: validation.data.date,
      createdAt: { $gte: duplicateWindowStart }
    }).select("_id");

    if (duplicatePost) {
      return NextResponse.json({ error: "A similar travel post was already published recently." }, { status: 409 });
    }
    const post = await TravelPost.create({
      userId: session.user.id,
      destination: validation.data.destination,
      date: validation.data.date,
      description: validation.data.description,
      phoneNumber: validation.data.phoneNumber,
      gender: validation.data.gender,
      profileImage: profileImages[0] || "",
      coverImage: coverImages[0] || "",
      interestedUserIds: []
    });

    const populatedPost = await post.populate("userId", "name email avatar");

    return NextResponse.json({ post: populatedPost }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create travel post.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
