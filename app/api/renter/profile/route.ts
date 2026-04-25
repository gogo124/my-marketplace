import { NextResponse } from "next/server";
import { createRouteErrorResponse } from "@/lib/api-errors";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { saveImageFiles } from "@/lib/image-upload";
import { validateImageFiles } from "@/lib/image-upload-shared";
import { getSessionUser, getUserPermissions } from "@/lib/permissions";
import { deleteUploadedFiles } from "@/lib/uploads";
import { validateRenterProfilePayload } from "@/lib/validation";
import RenterProfile from "@/models/RenterProfile";
import User from "@/models/User";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getAuthSession();
    const user = getSessionUser(session);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();

    const profile = await RenterProfile.findOne({ user: user.id }).populate("user", "name email avatar role");

    return NextResponse.json({ profile });
  } catch (error) {
    return createRouteErrorResponse(error, "Could not fetch renter profile.");
  }
}

export async function POST(request: Request) {
  let uploadedImages: string[] = [];

  try {
    const session = await getAuthSession();
    const user = getSessionUser(session);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();

    const currentUser = await User.findById(user.id).select("role canCreateRenter");

    if (!currentUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (currentUser.role === "agency") {
      return NextResponse.json({ error: "Agency accounts cannot create renter profiles." }, { status: 400 });
    }

    const existingProfile = await RenterProfile.findOne({ user: user.id })
      .select("logo coverImage verificationStatus")
      .lean();

    if (!getUserPermissions(currentUser, { hasRenterProfile: Boolean(existingProfile?._id) }).canOpenRenterProfile) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const formData = await request.formData();
    const payload = {
      name: String(formData.get("name") || ""),
      city: String(formData.get("city") || ""),
      description: String(formData.get("description") || ""),
      phone: String(formData.get("phone") || ""),
      whatsapp: String(formData.get("whatsapp") || ""),
      logo: String(formData.get("logo") || ""),
      coverImage: String(formData.get("coverImage") || "")
    };
    const validation = validateRenterProfilePayload(payload);

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const logoFile = formData.get("logoFile");
    const coverImageFile = formData.get("coverImageFile");
    const imageFiles = [logoFile, coverImageFile].filter((entry): entry is File => entry instanceof File && entry.size > 0);

    const imageValidationError = validateImageFiles({
      files: imageFiles,
      maxFiles: 2,
      label: "renter images"
    });

    if (imageValidationError) {
      return NextResponse.json({ error: imageValidationError }, { status: 400 });
    }

    uploadedImages = await saveImageFiles(imageFiles);
    const nextLogo =
      logoFile instanceof File && logoFile.size > 0
        ? uploadedImages[0] || validation.data.logo
        : validation.data.logo || existingProfile?.logo || "";
    const nextCoverImage =
      coverImageFile instanceof File && coverImageFile.size > 0
        ? uploadedImages[logoFile instanceof File && logoFile.size > 0 ? 1 : 0] || validation.data.coverImage
        : validation.data.coverImage || existingProfile?.coverImage || "";

    const replacedUploads: string[] = [];

    if (existingProfile?.logo && existingProfile.logo !== nextLogo && existingProfile.logo.startsWith("/uploads/")) {
      replacedUploads.push(existingProfile.logo);
    }

    if (
      existingProfile?.coverImage &&
      existingProfile.coverImage !== nextCoverImage &&
      existingProfile.coverImage.startsWith("/uploads/")
    ) {
      replacedUploads.push(existingProfile.coverImage);
    }

    const verificationStatus = existingProfile?.verificationStatus === "verified" ? "verified" : "pending";

    const profile = await RenterProfile.findOneAndUpdate(
      { user: user.id },
      {
        $set: {
          ...validation.data,
          logo: nextLogo,
          coverImage: nextCoverImage,
          verificationStatus
        }
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    ).populate("user", "name email avatar role");

    await User.findByIdAndUpdate(user.id, { $set: { role: "renter" } });

    if (replacedUploads.length > 0) {
      await deleteUploadedFiles(replacedUploads);
    }

    return NextResponse.json({ profile });
  } catch (error) {
    if (uploadedImages.length > 0) {
      await deleteUploadedFiles(uploadedImages);
    }

    return createRouteErrorResponse(error, "Could not save renter profile.");
  }
}
