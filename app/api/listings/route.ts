import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { saveImageFiles } from "@/lib/image-upload";
import { MAX_LISTING_IMAGES, validateImageFiles } from "@/lib/image-upload-shared";
import { deleteUploadedFiles } from "@/lib/uploads";
import { validateListingPayload } from "@/lib/validation";
import Listing from "@/models/Listing";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const type = String(searchParams.get("type") || "").trim();
    const status = String(searchParams.get("status") || "active").trim();
    const q = String(searchParams.get("q") || "").trim();
    const query: Record<string, unknown> = {};

    if (status === "active" || status === "inactive") {
      query.status = status;
    }

    if (type === "sale" || type === "rental") {
      query.type = type;
    }

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } }
      ];
    }

    const listings = await Listing.find(query)
      .populate("seller", "name email avatar")
      .sort({ createdAt: -1 });

    return NextResponse.json({ listings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not fetch listings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let uploadedImages: string[] = [];

  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const formData = await request.formData();
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const price = Number(formData.get("price"));
    const type = String(formData.get("type") || "sale").trim();
    const category = String(formData.get("category") || "").trim();
    const location = String(formData.get("location") || "").trim();
    const phoneNumber = String(formData.get("phoneNumber") || "").trim();
    const whatsappNumber = String(formData.get("whatsappNumber") || "").trim();
    const startDate = String(formData.get("startDate") || "").trim();
    const endDate = String(formData.get("endDate") || "").trim();
    const deposit = String(formData.get("deposit") || "").trim();
    const files = formData.getAll("images").filter((entry): entry is File => entry instanceof File);

    const validation = validateListingPayload({
      title,
      description,
      price,
      type,
      category,
      location,
      phoneNumber,
      whatsappNumber,
      startDate,
      endDate,
      deposit
    });

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const imageValidationError = validateImageFiles({
      files,
      maxFiles: MAX_LISTING_IMAGES,
      label: "images per listing"
    });

    if (imageValidationError) {
      return NextResponse.json({ error: imageValidationError }, { status: 400 });
    }

    await connectToDatabase();
    uploadedImages = await saveImageFiles(files);

    const listing = await Listing.create({
      ...validation.data,
      images: uploadedImages,
      seller: session.user.id
    });

    const populatedListing = await listing.populate("seller", "name email avatar");

    return NextResponse.json({ listing: populatedListing }, { status: 201 });
  } catch (error) {
    if (uploadedImages.length > 0) {
      await deleteUploadedFiles(uploadedImages);
    }

    const message = error instanceof Error ? error.message : "Could not create listing.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
