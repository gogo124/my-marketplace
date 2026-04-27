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
      <label htmlFor="trip-code-input" className="block text-sm font-semibold text-slate-700">
        {locale === "ar" ? "Trip Code" : "Code voyage"}
      </label>
      <input
        id="trip-code-input"
        type="text"
        value={tripCode}
        onChange={(event) => {
          setTripCode(event.target.value);
          if (error) {
            setError("");
          }
        }}
        placeholder={locale === "ar" ? "مثال: MTB-2048" : "Exemple : MTB-2048"}
        autoCapitalize="characters"
        autoCorrect="off"
        className="w-full rounded-2xl border border-[#0f3d2e]/10 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0f3d2e]/30 focus:ring-2 focus:ring-[#0f3d2e]/15"
      />
      <p className="text-sm leading-6 text-slate-500">
        {locale === "ar"
          ? "أدخل الكود الذي أرسلته لك الوكالة للوصول إلى تفاصيل رحلتك."
          : "Saisissez le code partage par votre agence pour acceder a votre voyage."}
      </p>
      <button
        type="submit"
        className="w-full rounded-full bg-[#f97316] px-5 py-3 font-semibold text-white transition hover:bg-[#ea580c] sm:w-auto"
      >
        {locale === "ar" ? "الدخول إلى الرحلة" : "Acceder au voyage"}
      </button>
      {error ? <p aria-live="polite" className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
