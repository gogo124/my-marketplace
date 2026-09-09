import { connectToDatabase } from "@/lib/db";
import { serializeDocument } from "@/lib/utils";
import Destination from "@/models/Destination";

export const DESTINATION_CATEGORIES = ["city", "nature", "desert", "mountains", "coast", "culture"] as const;
export type DestinationPayload = Record<string, any>;

function cleanLocalized(value: any) {
  return { ar: String(value?.ar || "").trim(), fr: String(value?.fr || "").trim(), en: String(value?.en || "").trim() };
}

export function validateDestinationPayload(input: DestinationPayload) {
  const name = cleanLocalized(input.name);
  const shortDescription = cleanLocalized(input.shortDescription);
  const coverImage = String(input.coverImage || "").trim();
  const slug = String(input.slug || "").trim().toLowerCase();
  if (!name.ar || !name.fr || !name.en) return { error: "Destination name is required in Arabic, French and English." };
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { error: "Slug must contain lowercase letters, numbers and hyphens only." };
  if (!coverImage || !/^https?:\/\//i.test(coverImage)) return { error: "A valid Cloudinary cover image URL is required." };
  return { data: { ...input, name, shortDescription, slug, coverImage, location: cleanLocalized(input.location), category: cleanLocalized(input.category), intro: cleanLocalized(input.intro), seoTitle: cleanLocalized(input.seoTitle), seoDescription: cleanLocalized(input.seoDescription) } };
}

export async function getPublishedDestinations() {
  await connectToDatabase();
  return serializeDocument(await Destination.find({ published: true }).sort({ displayOrder: 1, featured: -1, createdAt: -1 }).lean());
}

export async function getFeaturedDestinations(limit = 6) {
  await connectToDatabase();
  return serializeDocument(await Destination.find({ published: true, featured: true }).sort({ displayOrder: 1, createdAt: -1 }).limit(limit).lean());
}

export async function getDestinationBySlug(slug: string) {
  await connectToDatabase();
  return serializeDocument(await Destination.findOne({ slug, published: true }).populate({ path: "recommendedAgencies.agency", select: "name logo coverImage city description phone whatsapp" }).lean());
}

export async function getDestinationsForAdmin() {
  await connectToDatabase();
  return serializeDocument(await Destination.find({}).sort({ displayOrder: 1, createdAt: -1 }).lean());
}
