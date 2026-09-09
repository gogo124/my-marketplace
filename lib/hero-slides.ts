import { connectToDatabase } from "@/lib/db";
import { serializeDocument } from "@/lib/utils";
import HeroSlide from "@/models/HeroSlide";

function localized(value: any) {
  return { ar: String(value?.ar || "").trim(), fr: String(value?.fr || "").trim(), en: String(value?.en || "").trim() };
}

function safeUrl(value: any) {
  const url = String(value || "").trim();
  if (!url) return "";
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.toString() : "";
  } catch { return ""; }
}

export function validateHeroSlidePayload(input: any) {
  const image = safeUrl(input?.image);
  const title = localized(input?.title);
  if (!image) return { error: "A valid Cloudinary image is required." };
  if (!title.ar || !title.fr || !title.en) return { error: "Hero title is required in Arabic, French and English." };
  const ctaUrl = safeUrl(input?.ctaUrl);
  return { data: {
    image,
    imagePublicId: String(input?.imagePublicId || "").trim(),
    mobileImage: safeUrl(input?.mobileImage),
    mobileImagePublicId: String(input?.mobileImagePublicId || "").trim(),
    eyebrow: localized(input?.eyebrow),
    title,
    description: localized(input?.description),
    ctaLabel: localized(input?.ctaLabel),
    ctaUrl,
    displayOrder: Number.isFinite(Number(input?.displayOrder)) ? Number(input.displayOrder) : 0,
    published: Boolean(input?.published)
  } };
}

export async function getPublishedHeroSlides() {
  await connectToDatabase();
  return serializeDocument(await HeroSlide.find({ published: true }).sort({ displayOrder: 1, createdAt: -1 }).limit(8).lean());
}

export async function getHeroSlidesForAdmin() {
  await connectToDatabase();
  return serializeDocument(await HeroSlide.find({}).sort({ displayOrder: 1, createdAt: -1 }).lean());
}
