import { AFFILIATE_CURRENCIES, parseAffiliatePrice } from "@/lib/affiliate-price";
import { CAMPING_FEATURES, CAMPING_TYPES } from "@/lib/camping-options";
import { connectToDatabase } from "@/lib/db";
import { serializeDocument } from "@/lib/utils";
import Place from "@/models/Place";

export type CampingValidationField = "name" | "slug" | "description" | "image" | "galleryImages" | "ogImage" | "affiliateUrl" | "price" | "currency" | "discountedPrice" | "location" | "category" | "types";
export type CampingValidationErrors = Partial<Record<CampingValidationField, string>>;
const clean = (value: unknown) => typeof value === "string" ? value.trim() : "";
const list = (value: unknown) => Array.isArray(value) ? Array.from(new Set(value.map(clean).filter(Boolean))).slice(0, 30) : [];
const isHttpUrl = (value: string) => { try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; } };
const isImageUrl = (value: string) => value.startsWith("/") || isHttpUrl(value);
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const slugifyPlace = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);

export function validatePlacePayload(payload: unknown) {
  const input = (payload || {}) as Record<string, unknown>;
  const name = clean(input.name); const slug = slugifyPlace(clean(input.slug) || name); const description = clean(input.description); const shortDescription = clean(input.shortDescription); const metaTitle = clean(input.metaTitle); const metaDescription = clean(input.metaDescription); const ogImage = clean(input.ogImage); const image = clean(input.image); const galleryImages = list(input.galleryImages); const affiliateUrl = clean(input.affiliateUrl); const price = parseAffiliatePrice(input.price); const currency = clean(input.currency) || "MAD"; const discountedPrice = parseAffiliatePrice(input.discountedPrice); const location = clean(input.location); const category = clean(input.category); const submittedTypes = list(input.types); const types = submittedTypes.filter((type) => (CAMPING_TYPES as readonly string[]).includes(type)); const features = list(input.features).filter((feature) => (CAMPING_FEATURES as readonly string[]).includes(feature)); const featured = input.featured === true; const recommended = input.recommended === true; const status = input.status === "published" ? "published" : "draft";
  const fields: CampingValidationErrors = {};
  if (name.length < 3) fields.name = "Camping name must contain at least 3 characters.";
  if (!slug) fields.slug = "Enter a valid slug or a name that can generate one.";
  if (description.length < 20) fields.description = "Full description must contain at least 20 characters.";
  if (!image) fields.image = "Upload a main image to Cloudinary."; else if (!isImageUrl(image)) fields.image = "The uploaded main image URL is invalid.";
  if (galleryImages.some((item) => !isImageUrl(item))) fields.galleryImages = "One or more gallery image URLs are invalid.";
  if (ogImage && !isImageUrl(ogImage)) fields.ogImage = "The uploaded Open Graph image URL is invalid.";
  if (!affiliateUrl) fields.affiliateUrl = "Enter the Visit Now affiliate URL."; else if (!isHttpUrl(affiliateUrl)) fields.affiliateUrl = "Affiliate URL must start with http:// or https://.";
  if (price === null) fields.price = "Enter a valid price of 0 or more.";
  if (!(AFFILIATE_CURRENCIES as readonly string[]).includes(currency)) fields.currency = "Select MAD, EUR, or USD.";
  if (discountedPrice !== null && price !== null && discountedPrice >= price) fields.discountedPrice = "Discounted price must be lower than the regular price.";
  if (location.length < 2) fields.location = "Location must contain at least 2 characters.";
  if (category.length < 2) fields.category = "Category must contain at least 2 characters.";
  if (!types.length) fields.types = submittedTypes.length ? "The selected camping types are not recognized." : "Select at least one camping type.";
  if (Object.keys(fields).length) return { error: Object.values(fields)[0]!, fields };
  return { data: { name, slug, description, shortDescription, metaTitle, metaDescription, ogImage, image, galleryImages, affiliateUrl, price: price!, currency, discountedPrice, location, category, types, features, featured, recommended, status } };
}

export async function getPlaces(filters: any = {}) { await connectToDatabase(); const query: Record<string, unknown> = { status: "published" }; if (clean(filters.q)) query.name = { $regex: escapeRegex(clean(filters.q)), $options: "i" }; for (const key of ["location", "category"]) if (clean(filters[key])) query[key] = clean(filters[key]); if (clean(filters.type)) query.types = clean(filters.type); if (clean(filters.feature)) query.features = clean(filters.feature); if (filters.featured) query.featured = true; if (filters.recommended) query.recommended = true; const sort: Record<string, 1 | -1> = filters.sort === "popular" ? { viewCount: -1, clickCount: -1 } : filters.sort === "featured" ? { featured: -1, createdAt: -1 } : { createdAt: -1 }; return serializeDocument(await Place.find(query).sort(sort).limit(filters.limit || 0).lean()) as any[]; }
export async function getPlaceBySlug(slug: string) { await connectToDatabase(); return serializeDocument(await Place.findOne({ status: "published", ...(/^[a-f\d]{24}$/i.test(slug) ? { $or: [{ slug }, { _id: slug }] } : { slug }) }).lean()) as any | null; }
export async function getRelatedPlaces(place: any, limit = 4) { await connectToDatabase(); return serializeDocument(await Place.find({ _id: { $ne: place._id }, status: "published", $or: [{ location: place.location }, { category: place.category }, { types: { $in: place.types || [] } }, { features: { $in: place.features || [] } }] }).sort({ featured: -1, viewCount: -1 }).limit(limit).lean()) as any[]; }
export async function getPlaceFilterOptions() { await connectToDatabase(); const [locations, categories] = await Promise.all([Place.distinct("location", { status: "published" }), Place.distinct("category", { status: "published" })]); return { locations: locations.filter(Boolean).sort() as string[], categories: categories.filter(Boolean).sort() as string[] }; }
export async function getPlacesForAdmin() { await connectToDatabase(); return serializeDocument(await Place.find({}).sort({ createdAt: -1 }).lean()) as any[]; }
