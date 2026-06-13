export const AFFILIATE_CURRENCIES = ["MAD", "EUR", "USD"] as const;
export type AffiliateCurrency = (typeof AFFILIATE_CURRENCIES)[number];
export function parseAffiliatePrice(value: unknown) { if (value === null || value === undefined || value === "") return null; const price = Number(value); return Number.isFinite(price) && price >= 0 ? price : null; }
export function formatAffiliatePrice(price: number, currency: string) { return new Intl.NumberFormat("en", { style: "currency", currency: currency || "MAD", maximumFractionDigits: 2 }).format(price); }
