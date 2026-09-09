import { connectToDatabase } from "@/lib/db";
import { serializeDocument } from "@/lib/utils";
import Destination from "@/models/Destination";

export const DESTINATION_CATEGORIES = ["city", "nature", "desert", "mountains", "coast", "culture"] as const;
export type DestinationPayload = Record<string, any>;

function cleanLocalized(value: any) {
  return { ar: String(value?.ar || "").trim(), fr: String(value?.fr || "").trim(), en: String(value?.en || "").trim() };
}

function safeUrl(value: any) {
  const url = String(value || "").trim();
  if (!url) return "";
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.toString() : "";
  } catch {
    return "";
  }
}

function cleanSocials(value: any) {
  const keys = ["instagram", "facebook", "tiktok", "youtube", "website", "other"] as const;
  return Object.fromEntries(keys.map((key) => [key, safeUrl(value?.[key])]));
}

function cleanArticle(article: any) {
  if (!Array.isArray(article)) return [];
  return article.slice(0, 80).map((section) => ({
    type: ["heading", "paragraph", "list", "quote", "image", "tip"].includes(section?.type) ? section.type : "paragraph",
    title: cleanLocalized(section?.title), body: cleanLocalized(section?.body), imageUrl: safeUrl(section?.imageUrl),
    imagePublicId: String(section?.imagePublicId || "").trim(), caption: cleanLocalized(section?.caption),
    items: Array.isArray(section?.items) ? section.items.slice(0, 30).map(cleanLocalized) : [],
  }));
}

function cleanGallery(gallery: any) {
  if (!Array.isArray(gallery)) return [];
  return gallery.slice(0, 30).map((item) => ({ url: safeUrl(item?.url), publicId: String(item?.publicId || "").trim(), caption: cleanLocalized(item?.caption) })).filter((item) => item.url);
}

function cleanAgencies(value: any) {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.slice(0, 20).map((item) => ({ agency: String(item?.agency || "").trim(), description: cleanLocalized(item?.description), bookingUrl: safeUrl(item?.bookingUrl), socials: cleanSocials(item?.socials) })).filter((item) => {
    if (!item.agency || seen.has(item.agency)) return false;
    seen.add(item.agency); return true;
  });
}

export function validateDestinationPayload(input: DestinationPayload) {
  const name = cleanLocalized(input.name); const shortDescription = cleanLocalized(input.shortDescription);
  const coverImage = safeUrl(input.coverImage); const slug = String(input.slug || "").trim().toLowerCase();
  if (!name.ar || !name.fr || !name.en) return { error: "Destination name is required in Arabic, French and English." };
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { error: "Slug must contain lowercase letters, numbers and hyphens only." };
  if (!coverImage) return { error: "A valid Cloudinary cover image URL is required." };
  return { data: { ...input, name, shortDescription, slug, coverImage, location: cleanLocalized(input.location), category: cleanLocalized(input.category), intro: cleanLocalized(input.intro), seoTitle: cleanLocalized(input.seoTitle), seoDescription: cleanLocalized(input.seoDescription), gallery: cleanGallery(input.gallery), article: cleanArticle(input.article), recommendedAgencies: cleanAgencies(input.recommendedAgencies), displayOrder: Number.isFinite(Number(input.displayOrder)) ? Number(input.displayOrder) : 0, featured: Boolean(input.featured), published: Boolean(input.published) } };
}

export async function getPublishedDestinations() { await connectToDatabase(); return serializeDocument(await Destination.find({ published: true }).sort({ displayOrder: 1, featured: -1, createdAt: -1 }).lean()); }
export async function getFeaturedDestinations(limit = 6) { await connectToDatabase(); return serializeDocument(await Destination.find({ published: true, featured: true }).sort({ displayOrder: 1, createdAt: -1 }).limit(limit).lean()); }
export async function getDestinationBySlug(slug: string) { await connectToDatabase(); return serializeDocument(await Destination.findOne({ slug, published: true }).populate({ path: "recommendedAgencies.agency", select: "name logo coverImage city description phone whatsapp" }).lean()); }
export async function getDestinationsForAdmin() { await connectToDatabase(); return serializeDocument(await Destination.find({}).sort({ displayOrder: 1, createdAt: -1 }).lean()); }
