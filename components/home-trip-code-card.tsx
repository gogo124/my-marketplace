"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SiteLocale } from "@/lib/i18n";

export function HomeTripCodeCard({ locale }: { locale: SiteLocale }) {
  const router = useRouter();
  const [tripCode, setTripCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedCode = tripCode.trim().toUpperCase();

    if (!normalizedCode) {
      setError(locale === "ar" ? "دخل Trip Code." : "Enter a trip code.");
      return;
    }

    setError("");
    router.push(`/trip/${encodeURIComponent(normalizedCode)}${locale === "ar" ? "?lang=ar" : ""}`);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <input
        type="text"
        value={tripCode}
        onChange={(event) => {
          setTripCode(event.target.value);
          if (error) {
            setError("");
          }
        }}
        placeholder="دخل Trip Code"
        className="w-full rounded-2xl border border-ink/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-clay/30"
      />
      <button type="submit" className="w-full rounded-full bg-clay px-5 py-2.5 font-semibold text-white sm:w-auto">
        دخول
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
