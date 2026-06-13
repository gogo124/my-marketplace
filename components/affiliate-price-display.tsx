import { formatAffiliatePrice } from "@/lib/affiliate-price";

export function AffiliatePriceDisplay({ price, currency, discountedPrice, large = false }: { price?: number; currency?: string; discountedPrice?: number | null; large?: boolean }) {
  if (typeof price !== "number") return null;
  const discounted = typeof discountedPrice === "number" && discountedPrice < price;
  return <div className="flex flex-wrap items-center gap-2"><span className={`font-black tracking-[-.02em] text-forest ${large ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"}`}>{formatAffiliatePrice(discounted ? discountedPrice : price, currency || "MAD")}</span>{discounted ? <><span className="text-sm font-semibold text-ink/40 line-through">{formatAffiliatePrice(price, currency || "MAD")}</span><span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-clay">Special price</span></> : null}</div>;
}
