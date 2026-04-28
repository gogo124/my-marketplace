import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getSubmittedImageUrls, validateSubmittedImageUrls } from "@/lib/image-upload";
import { MAX_LISTING_IMAGES } from "@/lib/image-upload-shared";
import { getUserPermissions } from "@/lib/permissions";
import { validateRentalItemPayload } from "@/lib/validation";
import RentalItem from "@/models/RentalItem";
import RenterProfile from "@/models/RenterProfile";
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

    await connectToDatabase();

    const currentUser = await User.findById(session.user.id).select("role canCreateRenter canCreateAgency");

    if (!currentUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const profile = await RenterProfile.findOne({ user: session.user.id }).select("_id");

    if (!getUserPermissions(currentUser, { hasRenterProfile: Boolean(profile?._id) }).canOpenRenterProfile) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    if (!profile) {
      return NextResponse.json({ error: "Renter profile not found." }, { status: 404 });
    }

    const item = await RentalItem.findOne({ _id: id, renter: profile._id });

    if (!item) {
      return NextResponse.json({ error: "Rental item not found." }, { status: 404 });
    }

    const formData = await request.formData();
    const status = String(formData.get("status") || "").trim();
    const imageUrls = getSubmittedImageUrls(formData, "images");
    const update: Record<string, unknown> = {};

    if (
      formData.get("title") !== null ||
      formData.get("category") !== null ||
      formData.get("location") !== null ||
      formData.get("description") !== null ||
      formData.get("price") !== null
    ) {
      const validation = validateRentalItemPayload({
        title: formData.get("title") ?? item.title,
        category: formData.get("category") ?? item.category,
        location: formData.get("location") ?? item.location,
        city: formData.get("city") ?? item.city,
        region: formData.get("region") ?? item.region,
        size: formData.get("size") ?? item.size,
        description: formData.get("description") ?? item.description,
        price: formData.get("price") ?? item.price,
        itemType: formData.get("itemType") ?? item.itemType,
        packageItems:
          formData.get("packageItems") ??
          (Array.isArray(item.packageItems) ? item.packageItems.join("\n") : ""),
        quantityTotal: formData.get("quantityTotal") ?? item.quantityTotal,
        quantityAvailable: formData.get("quantityAvailable") ?? item.quantityAvailable,
        availabilityStatus: formData.get("availabilityStatus") ?? item.availabilityStatus,
        pickupInfo: formData.get("pickupInfo") ?? item.pickupInfo,
        deliveryInfo: formData.get("deliveryInfo") ?? item.deliveryInfo,
        isTrustedPartner: formData.get("isTrustedPartner") ?? String(Boolean(item.isTrustedPartner)),
        isRecommended: formData.get("isRecommended") ?? String(Boolean(item.isRecommended))
      });

      if ("error" in validation) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      Object.assign(update, validation.data);
    }

    if (status) {
      if (!["active", "inactive"].includes(status)) {
        return NextResponse.json({ error: "Invalid rental item status." }, { status: 400 });
      }

      update.status = status;
    }

    if (imageUrls.length > 0) {
      const imageValidationError = validateSubmittedImageUrls({
        urls: imageUrls,
        maxFiles: MAX_LISTING_IMAGES,
        label: "images per rental item"
      });

      if (imageValidationError) {
        return NextResponse.json({ error: imageValidationError }, { status: 400 });
      }

      update.images = imageUrls;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
    }

    const previousImages = Array.isArray(item.images) ? item.images : [];
    Object.assign(item, update);
    await item.save();

    return NextResponse.json({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update rental item.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await context.params;

    await connectToDatabase();

    const currentUser = await User.findById(session.user.id).select("role canCreateRenter canCreateAgency");

    if (!currentUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const profile = await RenterProfile.findOne({ user: session.user.id }).select("_id");

    if (!getUserPermissions(currentUser, { hasRenterProfile: Boolean(profile?._id) }).canOpenRenterProfile) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    if (!profile) {
      return NextResponse.json({ error: "Renter profile not found." }, { status: 404 });
    }

    const item = await RentalItem.findOneAndDelete({ _id: id, renter: profile._id });

    if (!item) {
      return NextResponse.json({ error: "Rental item not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete rental item.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
