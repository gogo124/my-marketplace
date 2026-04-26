"use client";

import { useEffect, useState } from "react";
import { resolveLocale, SiteLocale } from "@/lib/i18n";

type ListingSaveButtonProps = {
  listingId: string;
  locale?: SiteLocale;
};

const STORAGE_KEY = "saved-listings";

function loadSavedListings() {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];

    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

export function ListingSaveButton({ listingId, locale = "ar" }: ListingSaveButtonProps) {
  const safeLocale = resolveLocale(locale);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const current = loadSavedListings();
    setSaved(current.includes(listingId));
    setReady(true);
  }, [listingId]);

  function toggleSaved() {
    try {
      const current = loadSavedListings();
      const next = current.includes(listingId)
        ? current.filter((value) => value !== listingId)
        : [...current, listingId];

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSaved(next.includes(listingId));
    } catch {
      setSaved((value) => !value);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleSaved}
      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink shadow-card transition hover:-translate-y-0.5 hover:bg-sand/40"
      aria-pressed={saved}
      aria-label={safeLocale === "ar" ? "حفظ الإعلان" : "Enregistrer l'annonce"}
    >
      <span className={`text-lg leading-none transition ${ready && saved ? "text-[#f97316]" : "text-ink/40"}`}>♥</span>
      {safeLocale === "ar" ? (saved ? "محفوظ" : "حفظ") : saved ? "Enregistré" : "Enregistrer"}
    </button>
  );
}
