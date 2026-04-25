"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { getApiError, parseApiResponse } from "@/lib/api";
import { resolveLocale, translateApiError } from "@/lib/i18n";

export function PlaceSaveButton({
  placeId,
  initialSaved,
  initialCount,
  disabled
}: {
  placeId: string;
  initialSaved: boolean;
  initialCount: number;
  disabled?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const [saved, setSaved] = useState(initialSaved);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (disabled || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/places/${placeId}/save`, { method: "POST" });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not save place."), locale));
      }

      setSaved(Boolean(data.saved));
      setCount(Number(data.savedCount || 0));
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : translateApiError("Unexpected error.", locale));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={handleSave}
        className={`rounded-full px-4 py-2 text-sm font-semibold shadow-card disabled:opacity-60 ${
          saved ? "bg-clay text-white" : "border border-ink/10 bg-white text-ink"
        }`}
      >
        {loading
          ? locale === "ar"
            ? "جارٍ الحفظ..."
            : "Enregistrement..."
          : saved
            ? locale === "ar"
              ? `محفوظ • ${count}`
              : `Sauvegarde • ${count}`
            : locale === "ar"
              ? `احفظ المكان • ${count}`
              : `Sauvegarder • ${count}`}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
