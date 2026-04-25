import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getSubmittedImageUrls, validateSubmittedImageUrls } from "@/lib/image-upload";
import { checkRateLimit, getRequestIdentity } from "@/lib/rate-limit";
import { validateStoryPayload } from "@/lib/validation";
import Place from "@/models/Place";
import Story from "@/models/Story";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await connectToDatabase();

    const stories = await Story.find({ place: id, status: "approved" })
      .populate("author", "name avatar")
      .sort({ createdAt: -1 });

    return NextResponse.json({ stories });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not fetch stories.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await context.params;
    const rateLimit = checkRateLimit({
      key: `place-story:${id}:${session.user.id}:${getRequestIdentity(request, session.user.id)}`,
      limit: 4,
      windowMs: 60 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many story submissions. Please try again later." }, { status: 429 });
    }

    const formData = await request.formData();
    const imageUrls = getSubmittedImageUrls(formData, "image");
    const validation = validateStoryPayload({
      title: formData.get("title"),
      body: formData.get("body"),
      tripDate: formData.get("tripDate")
    });

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const imageValidationError = validateSubmittedImageUrls({
      urls: imageUrls,
      maxFiles: 1,
      label: "story image"
    });

    if (imageValidationError) {
      return NextResponse.json({ error: imageValidationError }, { status: 400 });
    }

    await connectToDatabase();

    const place = await Place.findById(id).select("status").lean();

    if (!place || place.status !== "approved") {
      return NextResponse.json({ error: "Place not found." }, { status: 404 });
    }
    const story = await Story.create({
      place: id,
      author: session.user.id,
      title: validation.data.title,
      body: validation.data.body,
      tripDate: validation.data.tripDate,
      image: imageUrls[0] || ""
    });

    const populatedStory = await story.populate("author", "name avatar");
    return NextResponse.json({ story: populatedStory }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create story.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
