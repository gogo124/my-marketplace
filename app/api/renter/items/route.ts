import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getSubmittedImageUrls, validateSubmittedImageUrls } from "@/lib/image-upload";
import { MAX_LISTING_IMAGES } from "@/lib/image-upload-shared";
import { validateRentalItemPayload } from "@/lib/validation";
import RentalItem from "@/models/RentalItem";
import RenterProfile from "@/models/RenterProfile";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();

    const profile = await RenterProfile.findOne({ user: session.user.id }).select("_id");

    if (!profile) {
      return NextResponse.json({ items: [] });
    }

    const items = await RentalItem.find({ renter: profile._id }).sort({ createdAt: -1 });
    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not fetch rental items.";
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
    const validation = validateRentalItemPayload({
      title: formData.get("title"),
      category: formData.get("category"),
      location: formData.get("location"),
      city: formData.get("city"),
      region: formData.get("region"),
      size: formData.get("size"),
      description: formData.get("description"),
      price: formData.get("price"),
      itemType: formData.get("itemType"),
      packageItems: formData.get("packageItems"),
      quantityTotal: formData.get("quantityTotal"),
      quantityAvailable: formData.get("quantityAvailable"),
      availabilityStatus: formData.get("availabilityStatus"),
      pickupInfo: formData.get("pickupInfo"),
      deliveryInfo: formData.get("deliveryInfo"),
      isTrustedPartner: formData.get("isTrustedPartner"),
      isRecommended: formData.get("isRecommended")
    });

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const imageValidationError = validateSubmittedImageUrls({
      urls: imageUrls,
      maxFiles: MAX_LISTING_IMAGES,
      label: "images per rental item"
    });

    if (imageValidationError) {
      return NextResponse.json({ error: imageValidationError }, { status: 400 });
    }

    await connectToDatabase();

    const profile = await RenterProfile.findOne({ user: session.user.id }).select("_id");

    if (!profile) {
      return NextResponse.json({ error: "Create your renter profile first." }, { status: 400 });
    }
    const item = await RentalItem.create({
      renter: profile._id,
      owner: session.user.id,
      ...validation.data,
      images: imageUrls
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create rental item.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
