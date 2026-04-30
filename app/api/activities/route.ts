import { NextResponse } from "next/server";
import { createRouteErrorResponse } from "@/lib/api-errors";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getSubmittedImageUrls, validateSubmittedImageUrls } from "@/lib/image-upload";
import { MAX_LISTING_IMAGES } from "@/lib/image-upload-shared";
import { canManageActivities, getPublicActivities } from "@/lib/activity";
import { validateActivityPayload } from "@/lib/validation";
import Activity from "@/models/Activity";
import User from "@/models/User";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await getPublicActivities({
      q: String(searchParams.get("q") || ""),
      city: String(searchParams.get("city") || ""),
      category: String(searchParams.get("category") || ""),
      page: Number(searchParams.get("page") || 1),
      pageSize: Number(searchParams.get("pageSize") || 12)
    });

    return NextResponse.json(result);
  } catch (error) {
    return createRouteErrorResponse(error, "Could not fetch activities.");
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!canManageActivities(session.user as any)) {
      return NextResponse.json({ error: "Active activity provider access is required." }, { status: 403 });
    }

    const formData = await request.formData();
    const imageUrls = getSubmittedImageUrls(formData, "images");
    const validation = validateActivityPayload({
      title: formData.get("title"),
      category: formData.get("category"),
      city: formData.get("city"),
      location: formData.get("location"),
      price: formData.get("price"),
      priceType: formData.get("priceType"),
      currency: formData.get("currency"),
      duration: formData.get("duration"),
      availableDays: formData.get("availableDays"),
      availableTimes: formData.get("availableTimes"),
      description: formData.get("description"),
      phone: formData.get("phone"),
      whatsapp: formData.get("whatsapp"),
      instagram: formData.get("instagram"),
      facebook: formData.get("facebook"),
      maxPeople: formData.get("maxPeople"),
      equipmentIncluded: formData.get("equipmentIncluded"),
      guideIncluded: formData.get("guideIncluded"),
      cancellationPolicy: formData.get("cancellationPolicy"),
      status: formData.get("status")
    });

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const imageValidationError = validateSubmittedImageUrls({
      urls: imageUrls,
      maxFiles: MAX_LISTING_IMAGES,
      label: "activity images"
    });

    if (imageValidationError) {
      return NextResponse.json({ error: imageValidationError }, { status: 400 });
    }

    await connectToDatabase();

    const currentUser = await User.findById(session.user.id).select("activityProviderStatus activityProviderApprovedAt activityProviderRequestedAt");

    if (!currentUser || !canManageActivities(currentUser as any)) {
      return NextResponse.json({ error: "Active activity provider access is required." }, { status: 403 });
    }

    const activity = await Activity.create({
      provider: session.user.id,
      ...validation.data,
      images: imageUrls
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    return createRouteErrorResponse(error, "Could not create activity.");
  }
}
