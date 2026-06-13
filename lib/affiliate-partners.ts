import { connectToDatabase } from "@/lib/db";
import AffiliatePartner from "@/models/AffiliatePartner";
import { serializeDocument } from "@/lib/utils";

const httpUrl = /^https?:\/\//i;
function text(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function isCloudinarySecureUrl(value: string) {
  try { const url = new URL(value); return url.protocol === "https:" && url.hostname === "res.cloudinary.com"; } catch { return false; }
}
export function validateAffiliatePartnerPayload(payload: any) {
  const name = text(payload?.name); const logoUrl = text(payload?.logoUrl); const websiteUrl = text(payload?.websiteUrl);
  const displayOrder = Number(payload?.displayOrder ?? 0); const active = payload?.active !== false;
  if (name.length < 2 || name.length > 160) return { error: "Partner name must be between 2 and 160 characters." };
  if (!isCloudinarySecureUrl(logoUrl)) return { error: "Upload a valid Cloudinary partner logo." };
  if (websiteUrl && !httpUrl.test(websiteUrl)) return { error: "Website URL must start with http:// or https://." };
  if (!Number.isInteger(displayOrder) || displayOrder < 0) return { error: "Display order must be a non-negative whole number." };
  return { data: { name, logoUrl, websiteUrl, displayOrder, active } };
}
export async function getAffiliatePartnersForAdmin() { await connectToDatabase(); return serializeDocument(await AffiliatePartner.find({}).sort({ displayOrder: 1, createdAt: 1 }).lean()); }
export async function getActiveAffiliatePartners() { await connectToDatabase(); return serializeDocument(await AffiliatePartner.find({ active: true }).sort({ displayOrder: 1, createdAt: 1 }).select("name logoUrl websiteUrl displayOrder").lean()); }
