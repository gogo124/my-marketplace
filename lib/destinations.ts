import { connectToDatabase } from "@/lib/db";
import { serializeDocument } from "@/lib/utils";
import Destination from "@/models/Destination";

export const DESTINATION_CATEGORIES = ["city", "nature", "desert", "mountains", "coast", "culture"] as const;
export type DestinationPayload = Record<string, any>;

function cleanLocalized(value: any) {
  return { ar: String(value?.ar || "").trim(), fr: String(value?.fr || "").trim(), en: String(value?.en || "").trim() };
}

export function safeExternalUrl(value: any) {
  const raw = String(value || "").trim();
  if (!raw || /[\u0000-\u001F\u007F]/.test(raw) || raw.startsWith("//")) return "";
  try {
    const url = new URL(raw);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}

function cleanWhatsApp(value: any) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\/wa\.me\//i.test(raw)) return safeExternalUrl(raw);
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 7 ? digits : "";
}

function cleanArticle(article: any) {
  if (!Array.isArray(article)) return [];
  return article.slice(0, 80).map((section) => ({
    type: ["heading", "paragraph", "list", "quote", "image", "tip"].includes(section?.type) ? section.type : "paragraph",
    title: cleanLocalized(section?.title),
    body: cleanLocalized(section?.body),
    imageUrl: safeExternalUrl(section?.imageUrl),
    imagePublicId: String(section?.imagePublicId || "").trim(),
    caption: cleanLocalized(section?.caption),
    items: Array.isArray(section?.items) ? section.items.slice(0, 30).map(cleanLocalized) : [],
  }));
}

function cleanGallery(gallery: any) {
  if (!Array.isArray(gallery)) return [];
  return gallery.slice(0, 30)
    .map((item) => ({ url: safeExternalUrl(item?.url), publicId: String(item?.publicId || "").trim(), caption: cleanLocalized(item?.caption) }))
    .filter((item) => item.url);
}

export function cleanDestinationAgencies(value: any) {
  if (!Array.isArray(value)) return { data: [] as any[] };
  const result: any[] = [];
  for (const raw of value.slice(0, 100)) {
    const name = String(raw?.name || "").trim();
    const bookNowUrl = safeExternalUrl(raw?.bookNowUrl || raw?.bookingUrl);
    if (!name) return { error: "Every destination agency must have a name." };
    if (!bookNowUrl) return { error: `Agency "${name}" must have a valid HTTP/HTTPS Book Now URL.` };
    const logo = raw?.logo ? safeExternalUrl(raw.logo) : "";
    const instagram = raw?.instagram ? safeExternalUrl(raw.instagram) : "";
    const whatsapp = cleanWhatsApp(raw?.whatsapp);
    result.push({ name, logo, instagram, whatsapp, bookNowUrl });
  }
  return { data: result };
}

function normalizeDestination(value: any) {
  if (!value) return value;
  return {
    ...value,
    destinationAgencies: Array.isArray(value.destinationAgencies)
      ? value.destinationAgencies.map((agency: any) => ({
          ...agency,
          bookNowUrl: agency?.bookNowUrl || agency?.bookingUrl || "",
        }))
      : [],
  };
}

export function validateDestinationPayload(input: DestinationPayload) {
  const name = cleanLocalized(input.name);
  const shortDescription = cleanLocalized(input.shortDescription);
  const coverImage = safeExternalUrl(input.coverImage);
  const slug = String(input.slug || "").trim().toLowerCase();
  if (!name.ar || !name.fr || !name.en) return { error: "Destination name is required in Arabic, French and English." };
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { error: "Slug must contain lowercase letters, numbers and hyphens only." };
  if (!coverImage) return { error: "A valid Cloudinary cover image URL is required." };
  const agencies = cleanDestinationAgencies(input.destinationAgencies);
  if ("error" in agencies) return agencies;
  return {
    data: {
      ...input,
      name,
      shortDescription,
      slug,
      coverImage,
      location: cleanLocalized(input.location),
      category: cleanLocalized(input.category),
      intro: cleanLocalized(input.intro),
      seoTitle: cleanLocalized(input.seoTitle),
      seoDescription: cleanLocalized(input.seoDescription),
      gallery: cleanGallery(input.gallery),
      article: cleanArticle(input.article),
      destinationAgencies: agencies.data,
      displayOrder: Number.isFinite(Number(input.displayOrder)) ? Number(input.displayOrder) : 0,
      featured: Boolean(input.featured),
      published: Boolean(input.published),
    },
  };
}

export async function getPublishedDestinations() {
  await connectToDatabase();
  const destinations = await Destination.find({ published: true }).sort({ displayOrder: 1, featured: -1, createdAt: -1 }).lean();
  return serializeDocument(destinations.map(normalizeDestination));
}

export async function getFeaturedDestinations(limit = 6) {
  await connectToDatabase();
  const destinations = await Destination.find({ published: true, featured: true }).sort({ displayOrder: 1, createdAt: -1 }).limit(limit).lean();
  return serializeDocument(destinations.map(normalizeDestination));
}

export async function getDestinationBySlug(slug: string) {
  await connectToDatabase();
  return serializeDocument(normalizeDestination(await Destination.findOne({ slug, published: true }).lean()));
}

export async function getDestinationsForAdmin() {
  await connectToDatabase();
  const destinations = await Destination.find({}).sort({ displayOrder: 1, createdAt: -1 }).lean();
  return serializeDocument(destinations.map(normalizeDestination));
}
