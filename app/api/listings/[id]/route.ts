import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { createRouteErrorResponse } from "@/lib/api-errors";
import { connectToDatabase } from "@/lib/db";
import { canPublishListing, getPublicSellerQuery } from "@/lib/seller";
import Listing from "@/models/Listing";
import User from "@/models/User";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await params;
    const listing = await Listing.findById(id)
      .select(
        "title description price type category location phoneNumber whatsappNumber startDate endDate deposit images seller status createdAt"
      )
      .populate("seller", "name email avatar sellerVerificationStatus verified")
      .lean();

    if (!listing) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }

    const sellerId = typeof (listing as any).seller === "object" ? (listing as any).seller?._id : (listing as any).seller;
    const activeSeller = await User.findOne({
      _id: sellerId,
      ...getPublicSellerQuery()
    })
      .select("_id")
      .lean();

    if (!activeSeller) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }

    return NextResponse.json({ listing });
  } catch (error) {
    return createRouteErrorResponse(error, "Could not fetch listing.", {
      logContext: "api.listing.get",
      logDetails: { url: request.url }
    });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!["active", "inactive"].includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    if (status === "active") {
      const currentUser = await User.findById(session.user.id).select("sellerStatus sellerExpiresAt sellerPlan");

      if (!currentUser || !canPublishListing(currentUser as any)) {
        return NextResponse.json({ error: "Active seller access is required to publish listings." }, { status: 403 });
      }
    }

    const listing = await Listing.findOneAndUpdate(
      { _id: id, seller: session.user.id },
      { status },
      { new: true }
    )
      .populate("seller", "name email avatar sellerVerificationStatus verified")
      .lean();

    if (!listing) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }

    return NextResponse.json({ listing });
  } catch (error) {
    return createRouteErrorResponse(error, "Could not update listing.", {
      logContext: "api.listing.patch"
    });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const listing = await Listing.findOneAndDelete({ _id: id, seller: session.user.id }).lean();

    if (!listing) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return createRouteErrorResponse(error, "Could not delete listing.", {
      logContext: "api.listing.delete",
      logDetails: { url: request.url }
    });
  }
}
