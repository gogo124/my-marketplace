import type { FilterQuery } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import Listing from "@/models/Listing";
import User from "@/models/User";
import { serializeDocument } from "@/lib/utils";

export type SellerStatus = "none" | "pending" | "active" | "expired" | "suspended" | "rejected";
export type SellerPlan = "free" | "monthly" | null;

type SellerProfileLike = {
  businessName?: string | null;
  city?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  description?: string | null;
  whatTheySell?: string | null;
} | null | undefined;

export type SellerUserLike = {
  id?: string | null;
  sellerStatus?: SellerStatus | null;
  sellerPlan?: SellerPlan | null;
  sellerExpiresAt?: string | Date | null;
  sellerRequestedAt?: string | Date | null;
  sellerApprovedAt?: string | Date | null;
  sellerProfile?: SellerProfileLike;
} | null | undefined;

export function normalizeSellerStatus(value: unknown): SellerStatus {
  if (
    value === "pending" ||
    value === "active" ||
    value === "expired" ||
    value === "suspended" ||
    value === "rejected"
  ) {
    return value;
  }

  return "none";
}

function normalizeSellerDate(value: unknown) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isFinite(date.getTime()) ? date : null;
}

export function isSellerExpired(value: unknown) {
  const expiresAt = normalizeSellerDate(value);

  if (!expiresAt) {
    return true;
  }

  return expiresAt.getTime() <= Date.now();
}

export function getEffectiveSellerStatus(user: SellerUserLike): SellerStatus {
  const sellerStatus = normalizeSellerStatus(user?.sellerStatus);

  if (sellerStatus === "active" && isSellerExpired(user?.sellerExpiresAt)) {
    return "expired";
  }

  if (sellerStatus === "expired") {
    return "expired";
  }

  return sellerStatus;
}

export function canAccessSellerDashboard(user: SellerUserLike) {
  return Boolean(user?.id);
}

export function canPublishListing(user: SellerUserLike) {
  return getEffectiveSellerStatus(user) === "active";
}

export function canManageSellerListings(user: SellerUserLike) {
  return canPublishListing(user);
}

export function hasSellerRequestProfile(user: SellerUserLike) {
  const profile = user?.sellerProfile;

  if (!profile) {
    return false;
  }

  return Boolean(
    profile.businessName ||
      profile.city ||
      profile.phone ||
      profile.whatsapp ||
      profile.instagram ||
      profile.facebook ||
      profile.description ||
      profile.whatTheySell
  );
}

export function getSellerAccessSnapshot(user: SellerUserLike) {
  const status = normalizeSellerStatus(user?.sellerStatus);
  const effectiveStatus = getEffectiveSellerStatus(user);
  const expiresAt = normalizeSellerDate(user?.sellerExpiresAt);

  return {
    status,
    effectiveStatus,
    sellerPlan: (user?.sellerPlan === "free" || user?.sellerPlan === "monthly" ? user.sellerPlan : null) as SellerPlan,
    sellerExpiresAt: expiresAt,
    sellerRequestedAt: normalizeSellerDate(user?.sellerRequestedAt),
    sellerApprovedAt: normalizeSellerDate(user?.sellerApprovedAt),
    canRequestAccess: status === "none",
    canPublish: effectiveStatus === "active",
    canManageListings: effectiveStatus === "active",
    isPending: effectiveStatus === "pending",
    isRejected: effectiveStatus === "rejected",
    isSuspended: effectiveStatus === "suspended",
    isExpired: effectiveStatus === "expired",
    hasProfile: hasSellerRequestProfile(user)
  };
}

export function getPublicSellerQuery(now = new Date()): FilterQuery<any> {
  return {
    sellerStatus: "active",
    sellerExpiresAt: { $gt: now }
  };
}

function slugifySegment(value: string) {
  const normalized = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return normalized || "seller";
}

export function getSellerStoreSlug(user: {
  _id?: string | null;
  id?: string | null;
  name?: string | null;
}) {
  const userId = String(user?._id || user?.id || "").trim();
  const fallbackId = userId || "unknown";
  const safeName = slugifySegment(String(user?.name || ""));

  if (!userId) {
    return safeName;
  }

  return `${safeName}-${userId}`;
}

function extractSellerIdFromSlug(slug: string) {
  const normalizedSlug = String(slug || "").trim();

  if (!normalizedSlug) {
    return "";
  }

  const parts = normalizedSlug.split("-");
  const candidate = parts[parts.length - 1];

  if (/^[a-f0-9]{24}$/i.test(candidate)) {
    return candidate;
  }

  if (/^[a-f0-9]{24}$/i.test(normalizedSlug)) {
    return normalizedSlug;
  }

  return "";
}

export async function getPublicSellerStoreData(slug: string) {
  await connectToDatabase();

  const sellerId = extractSellerIdFromSlug(slug);

  if (!sellerId) {
    return null;
  }

  const seller = await User.findOne({
    _id: sellerId,
    ...getPublicSellerQuery()
  })
    .select(
      "name email avatar sellerStatus sellerPlan sellerExpiresAt sellerApprovedAt sellerRequestedAt sellerProfile sellerVerificationStatus verified"
    )
    .lean();

  if (!seller) {
    return null;
  }

  const listings = await Listing.find({
    seller: sellerId,
    status: "active"
  })
    .select(
      "title description price type category location phoneNumber whatsappNumber startDate endDate deposit images seller status createdAt"
    )
    .populate("seller", "name email avatar sellerVerificationStatus verified")
    .sort({ createdAt: -1 })
    .lean();

  const normalizedSeller = serializeDocument(seller) as any;
  const normalizedListings = serializeDocument(listings) as any[];

  return {
    seller: {
      ...normalizedSeller,
      storeSlug: getSellerStoreSlug(normalizedSeller)
    },
    listings: normalizedListings
  };
}

export async function getPublicSellerDirectory(limit = 12) {
  await connectToDatabase();

  const sellers = await User.find(getPublicSellerQuery())
    .select(
      "name email avatar sellerStatus sellerPlan sellerExpiresAt sellerApprovedAt sellerRequestedAt sellerProfile sellerVerificationStatus verified"
    )
    .sort({ sellerApprovedAt: -1, updatedAt: -1, createdAt: -1 })
    .limit(Math.max(1, limit))
    .lean();

  const sellerIds = sellers.map((seller: any) => seller._id);
  const normalizedSellers = serializeDocument(sellers) as any[];
  const listingCounts = await Listing.aggregate([
    {
      $match: {
        seller: { $in: sellerIds },
        status: "active"
      }
    },
    {
      $group: {
        _id: "$seller",
        count: { $sum: 1 }
      }
    }
  ]);
  const listingCountBySellerId = new Map(listingCounts.map((entry) => [String(entry._id), Number(entry.count || 0)]));

  return normalizedSellers.map((seller) => ({
    ...seller,
    storeSlug: getSellerStoreSlug(seller),
    activeListingsCount: listingCountBySellerId.get(String(seller._id)) || 0
  }));
}
