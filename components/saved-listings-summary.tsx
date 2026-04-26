"use client";

import { useEffect, useState } from "react";
import { SiteLocale, resolveLocale } from "@/lib/i18n";

type SavedListingsSummaryProps = {
  locale?: SiteLocale;
};

const STORAGE_KEY = "saved-listings";

export function SavedListingsSummary({ locale = "ar" }: SavedListingsSummaryProps) {
  const safeLocale = resolveLocale(locale);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setCount(Array.isArray(parsed) ? parsed.length : 0);
    } catch {
      setCount(0);
    }
  }, []);

  return (
    <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-[0_12px_34px_rgba(15,61,46,0.08)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-slate-500">
          {safeLocale === "ar" ? "العناصر المحفوظة" : "Saved listings"}
        </p>
        <span className="rounded-full border border-[#f97316]/20 bg-[#f97316]/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#c2410c]">
          {safeLocale === "ar" ? "محلي" : "Local"}
        </span>
      </div>
      <p className="mt-3 text-3xl font-black leading-none text-slate-900">
        {count === null ? "..." : count}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        {safeLocale === "ar"
          ? "تُحفظ في المتصفح الحالي بدون التأثير على البيانات."
          : "Stored in this browser without touching your backend data."}
      </p>
    </div>
  );
}
