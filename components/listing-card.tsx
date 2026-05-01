"use client";

import Image from "next/image";
import Link from "next/link";
import { VerificationBadge } from "@/components/verification-badge";
import { LightboxImage } from "@/components/lightbox-image";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { localizeRecordField, resolveLocale, SiteLocale, siteCopy, withLocale } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";

type ListingCardProps = {
  listing: {
    _id: string;
    title: string;
    price: number;
    type?: string;
    category: string;
    location: string;
    description?: string;
    createdAt?: string;
    images?: string[];
    seller?: { name?: string; sellerVerificationStatus?: string; verified?: boolean };
  };
  locale?: SiteLocale;
};

function deriveCondition(title: string, description: string, locale: SiteLocale) {
  const text = `${title} ${description}`.toLowerCase();

  if (/occasion|used|second|مستعمل|مستخدمة|مستعملة/.test(text)) {
    return locale === "ar" ? "مستعمل" : "Occasion";
  }

  return locale === "ar" ? "جديد" : "Neuf";
}

export function ListingCard({ listing, locale = "ar" }: ListingCardProps) {
  const safeLocale = resolveLocale(locale);
  const copy = siteCopy[safeLocale];
  const image = listing.images?.[0] || "/images/buy-gear.jpg";
  const title = localizeRecordField(listing as Record<string, any>, "title", safeLocale, listing.title);
  const category = localizeRecordField(listing as Record<string, any>, "category", safeLocale, listing.category);
  const location = localizeRecordField(listing as Record<string, any>, "location", safeLocale, listing.location);
  const description = localizeRecordField(listing as Record<string, any>, "description", safeLocale, listing.description || "");
  const condition = deriveCondition(title, description, safeLocale);
  const isRecent = listing.createdAt ? Date.now() - new Date(listing.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000 : false;
  const verified = Boolean(listing.seller?.sellerVerificationStatus === "verified" || listing.seller?.verified);
  const trustLine = verified
    ? safeLocale === "ar"
      ? "بائع موثق"
      : "Vendeur verifie"
    : safeLocale === "ar"
      ? "تواصل مباشر"
      : "Contact direct";

  return (
    <article className="group flex min-h-[420px] flex-col overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white shadow-[0_16px_40px_rgba(15,61,46,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(15,61,46,0.16)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <LightboxImage
          src={image}
          alt={title}
          images={listing.images?.length ? listing.images : [image]}
          wrapperClassName="relative block h-full w-full"
          imageClassName="object-cover object-center transition duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04)_0%,rgba(15,61,46,0.18)_50%,rgba(0,0,0,0.72)_100%)] transition duration-500 group-hover:bg-[linear-gradient(180deg,rgba(15,23,42,0.12)_0%,rgba(15,61,46,0.3)_50%,rgba(0,0,0,0.82)_100%)]" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="inline-flex rounded-full bg-black/40 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
            {category}
          </span>
          <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#0f3d2e] shadow-sm backdrop-blur-md">
            {condition}
          </span>
          {isRecent ? (
            <span className="inline-flex rounded-full bg-[#f97316] px-3 py-1 text-xs font-bold text-white shadow-sm">
              {safeLocale === "ar" ? "تم النشر مؤخراً" : "Publié récemment"}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Link
              href={withLocale(`/listings/${listing._id}`, safeLocale)}
              onClick={() => trackAnalyticsEvent("listing_click", { listing_id: listing._id, category, type: listing.type || "sale" })}
              className="line-clamp-2 text-xl font-black leading-tight text-slate-900 hover:text-[#0f3d2e]"
            >
              {title}
            </Link>
            <div className="mt-3 inline-flex rounded-full bg-[#fff7ed] px-4 py-2 text-lg font-black text-[#c2410c]">
              {formatPrice(listing.price, safeLocale)}
            </div>
          </div>
          <div className="shrink-0 rounded-[1.25rem] bg-slate-50 px-4 py-3 text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              {safeLocale === "ar" ? "الثقة" : "Confiance"}
            </p>
            <span className="mt-1 block text-sm font-bold text-slate-700">{trustLine}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span className="truncate">{location}</span>
          <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
            {listing.type === "rental" ? copy.rental : copy.sale}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <p className="truncate">
            {copy.seller}: {listing.seller?.name || copy.marketplaceUser}
          </p>
          {verified ? (
            <VerificationBadge
              type="seller"
              locale={safeLocale}
              status={listing.seller?.sellerVerificationStatus || "verified"}
            />
          ) : null}
        </div>
        <p className="line-clamp-2 text-sm leading-7 text-slate-600">{description}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <Link
            href={withLocale(`/listings/${listing._id}`, safeLocale)}
            onClick={() => trackAnalyticsEvent("listing_click", { listing_id: listing._id, category, type: listing.type || "sale" })}
            className="inline-flex items-center gap-2 rounded-full bg-[#0f3d2e] px-4 py-2 text-sm font-semibold text-white transition duration-300 group-hover:translate-x-1"
          >
            {safeLocale === "ar" ? "استكشف المنتج" : "Explore"}
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#f97316] opacity-90 transition duration-300 group-hover:opacity-100">
            {safeLocale === "ar" ? "تفاصيل" : "Details"}
          </span>
        </div>
      </div>
    </article>
  );
}
