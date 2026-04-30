import { NextResponse } from "next/server";
import { createRouteErrorResponse } from "@/lib/api-errors";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getSubmittedImageUrls, validateSubmittedImageUrls } from "@/lib/image-upload";
import { MAX_LISTING_IMAGES } from "@/lib/image-upload-shared";
import { canManageActivities } from "@/lib/activity";
import { validateActivityPayload } from "@/lib/validation";
import Activity from "@/models/Activity";
import User from "@/models/User";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await context.params;
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

    const activity = await Activity.findOneAndUpdate(
      { _id: id, provider: session.user.id },
      {
        $set: {
          ...validation.data,
          images: imageUrls
        }
      },
      { new: true }
    );

    if (!activity) {
      return NextResponse.json({ error: "Activity not found." }, { status: 404 });
    }

    return NextResponse.json({ activity });
  } catch (error) {
    return createRouteErrorResponse(error, "Could not update activity.");
  }
}
