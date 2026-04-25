import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { getPlaces, parseCoordinatesFromMapInput } from "@/lib/camping";
import { connectToDatabase } from "@/lib/db";
import { getSubmittedImageUrls, validateSubmittedImageUrls } from "@/lib/image-upload";
import { MAX_LISTING_IMAGES } from "@/lib/image-upload-shared";
import { checkRateLimit, getRequestIdentity } from "@/lib/rate-limit";
import { validatePlacePayload } from "@/lib/validation";
import Place from "@/models/Place";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const places = await getPlaces({
      q: searchParams.get("q") || "",
      city: searchParams.get("city") || "",
      category: searchParams.get("category") || "",
      bestSeason: searchParams.get("bestSeason") || "",
      safety: searchParams.get("safety") || ""
    });

    return NextResponse.json({ places });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not fetch places.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const formData = await request.formData();
    const imageUrls = getSubmittedImageUrls(formData, "images");
    const payload = {
      name: formData.get("name"),
      city: formData.get("city"),
      mapLink: formData.get("mapLink"),
      description: formData.get("description"),
      category: formData.get("category"),
      safety: formData.get("safety"),
      bestSeason: formData.get("bestSeason")
    };

    const validation = validatePlacePayload(payload);

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const imageValidationError = validateSubmittedImageUrls({
      urls: imageUrls,
      maxFiles: MAX_LISTING_IMAGES,
      label: "images"
    });

    if (imageValidationError) {
      return NextResponse.json({ error: imageValidationError }, { status: 400 });
    }

    const rateLimit = checkRateLimit({
      key: `place:${session.user.id}:${getRequestIdentity(request, session.user.id)}`,
      limit: 8,
      windowMs: 15 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many place submissions. Please try again later.",
          retryAfterMs: rateLimit.retryAfterMs || 0
        },
        {
          status: 429,
          headers: rateLimit.retryAfterMs
            ? { "Retry-After": String(Math.max(1, Math.ceil(rateLimit.retryAfterMs / 1000))) }
            : undefined
        }
      );
    }

    await connectToDatabase();

    const place = await Place.create({
      ...validation.data,
      createdBy: session.user.id,
      status: "pending",
      coordinates: parseCoordinatesFromMapInput(validation.data.mapLink),
      images: imageUrls
    });

    const populatedPlace = await place.populate("createdBy", "name avatar");

    return NextResponse.json(
      {
        place: populatedPlace,
        message: "Place submitted successfully. It is pending admin approval before appearing publicly."
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create place.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
