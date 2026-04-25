import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { createRouteErrorResponse } from "@/lib/api-errors";
import { connectToDatabase } from "@/lib/db";
import { getSubmittedImageUrls, validateSubmittedImageUrls } from "@/lib/image-upload";
import { MAX_LISTING_IMAGES } from "@/lib/image-upload-shared";
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
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(24, Math.max(1, Number(searchParams.get("pageSize")) || 12));
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

    const [listings, total] = await Promise.all([
      Listing.find(query)
        .select(
          "title description price type category location phoneNumber whatsappNumber startDate endDate deposit images seller status createdAt"
        )
        .populate("seller", "name email avatar sellerVerificationStatus verified")
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Listing.countDocuments(query)
    ]);

    return NextResponse.json({
      listings,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        hasNextPage: page * pageSize < total,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    return createRouteErrorResponse(error, "Could not fetch listings.", {
      logContext: "api.listings.get",
      logDetails: { url: request.url }
    });
  }
}

export async function POST(request: Request) {
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
    const imageUrls = getSubmittedImageUrls(formData, "images");

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

    const imageValidationError = validateSubmittedImageUrls({
      urls: imageUrls,
      maxFiles: MAX_LISTING_IMAGES,
      label: "images per listing"
    });

    if (imageValidationError) {
      return NextResponse.json({ error: imageValidationError }, { status: 400 });
    }

    await connectToDatabase();

    const listing = await Listing.create({
      ...validation.data,
      images: imageUrls,
      seller: session.user.id
    });

    const populatedListing = await listing.populate("seller", "name email avatar");

    return NextResponse.json({ listing: populatedListing }, { status: 201 });
  } catch (error) {
    return createRouteErrorResponse(error, "Could not create listing.", {
      duplicateKeyMessage: "A listing with these details already exists.",
      logContext: "api.listings.post"
    });
  }
}
