"use client";

import { useState } from "react";
import { resolveLocale, SiteLocale } from "@/lib/i18n";

export function SellerStoreActions({
  storePath,
  locale,
  sellerName
}: {
  storePath: string;
  locale?: SiteLocale;
  sellerName?: string;
}) {
  const safeLocale = resolveLocale(locale);
  const isArabic = safeLocale === "ar";
  const [copied, setCopied] = useState(false);

  const absoluteUrl = typeof window !== "undefined" ? `${window.location.origin}${storePath}` : storePath;
  const whatsappText = encodeURIComponent(
    isArabic
      ? `شوف متجر ${sellerName || "البائع"} هنا: ${absoluteUrl}`
      : `Decouvre la boutique de ${sellerName || "ce vendeur"} ici : ${absoluteUrl}`
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900"
      >
        {copied ? (isArabic ? "تم النسخ" : "Copied") : isArabic ? "نسخ الرابط" : "Copy link"}
      </button>
      <a
        href={`https://wa.me/?text=${whatsappText}`}
        target="_blank"
        rel="noreferrer"
        className="rounded-full bg-[#0f3d2e] px-4 py-2 text-sm font-semibold text-white"
      >
        {isArabic ? "مشاركة عبر واتساب" : "Share on WhatsApp"}
      </a>
    </div>
  );
}
