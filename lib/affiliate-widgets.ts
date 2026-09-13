import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { serializeDocument } from "@/lib/utils";
import AffiliateWidget from "@/models/AffiliateWidget";
import Destination from "@/models/Destination";

export const AFFILIATE_WIDGET_PROVIDERS = ["Viator", "GetYourGuide", "Tripadvisor", "Booking", "Other"] as const;
export const AFFILIATE_WIDGET_TYPES = ["widget", "embed", "affiliate_link"] as const;
export const AFFILIATE_WIDGET_PLACEMENTS = ["activities", "destinations", "camping"] as const;

const clean = (value: unknown) => typeof value === "string" ? value.trim() : "";
const isHttpUrl = (value: string) => {
  try { const protocol = new URL(value).protocol; return protocol === "http:" || protocol === "https:"; }
  catch { return false; }
};

export type AffiliateWidgetInput = {
  name: string;
  provider: typeof AFFILIATE_WIDGET_PROVIDERS[number];
  type: typeof AFFILIATE_WIDGET_TYPES[number];
  placement: typeof AFFILIATE_WIDGET_PLACEMENTS[number];
  destinationId: string | null;
  destinationSlug: string;
  embedCode: string;
  affiliateUrl: string;
  active: boolean;
};

export function validateAffiliateWidgetPayload(payload: unknown): { data: AffiliateWidgetInput } | { error: string } {
  const input = (payload || {}) as Record<string, unknown>;
  const name = clean(input.name);
  const provider = clean(input.provider) as AffiliateWidgetInput["provider"];
  const type = clean(input.type) as AffiliateWidgetInput["type"];
  const placement = clean(input.placement) as AffiliateWidgetInput["placement"];
  const destinationId = clean(input.destinationId) || null;
  const destinationSlug = clean(input.destinationSlug).toLowerCase();
  const embedCode = clean(input.embedCode);
  const affiliateUrl = clean(input.affiliateUrl);
  const active = input.active !== false;

  if (name.length < 2 || name.length > 160) return { error: "Widget name must be between 2 and 160 characters." };
  if (!AFFILIATE_WIDGET_PROVIDERS.includes(provider)) return { error: "Select a valid provider." };
  if (!AFFILIATE_WIDGET_TYPES.includes(type)) return { error: "Select a valid widget type." };
  if (!AFFILIATE_WIDGET_PLACEMENTS.includes(placement)) return { error: "Select a valid placement." };
  if (destinationId && !isValidObjectId(destinationId)) return { error: "Invalid destination." };
  if (type === "affiliate_link" && !isHttpUrl(affiliateUrl)) return { error: "Affiliate URL must be a valid HTTP or HTTPS URL." };
  if (type !== "affiliate_link" && !embedCode) return { error: "Embed code is required for this widget type." };
  if (type === "affiliate_link" && embedCode) return { error: "Affiliate links do not need embed code." };

  return { data: { name, provider, type, placement, destinationId, destinationSlug, embedCode, affiliateUrl, active } };
}

export async function getAffiliateWidgetsForAdmin() {
  await connectToDatabase();
  return serializeDocument(await AffiliateWidget.find({}).sort({ createdAt: -1 }).lean()) as any[];
}

export async function getPublishedAffiliateWidgets(
  placement: AffiliateWidgetInput["placement"],
  destinationSlug = "",
) {
  await connectToDatabase();
  const slug = destinationSlug.trim().toLowerCase();
  const query = slug
    ? { active: true, placement, $or: [{ destinationSlug: "" }, { destinationSlug: slug }] }
    : { active: true, placement, destinationSlug: "" };
  return serializeDocument(await AffiliateWidget.find(query).sort({ createdAt: -1 }).lean()) as any[];
}

export async function normalizeAffiliateWidgetDestination(data: AffiliateWidgetInput) {
  if (!data.destinationId) return { ...data, destinationSlug: "" };
  await connectToDatabase();
  const destination = await Destination.findById(data.destinationId).select("_id slug").lean();
  if (!destination) throw new Error("Destination not found.");
  return { ...data, destinationSlug: String(destination.slug).toLowerCase() };
}
