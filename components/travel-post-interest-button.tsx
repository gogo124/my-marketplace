"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { getApiError, parseApiResponse } from "@/lib/api";
import { buildLoginPath } from "@/lib/auth-flow";
import { resolveLocale, translateApiError } from "@/lib/i18n";

type TravelPostInterestButtonProps = {
  postId: string;
  initialInterested: boolean;
  initialCount: number;
  isSignedIn: boolean;
  onChange?: (nextState: { interested: boolean; interestedCount: number }) => void;
};

export function TravelPostInterestButton({
  postId,
  initialInterested,
  initialCount,
  isSignedIn,
  onChange
}: TravelPostInterestButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const [interested, setInterested] = useState(initialInterested);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    if (loading) {
      return;
    }

    if (!isSignedIn) {
      router.push(buildLoginPath(pathname || "/travel-partners", searchParams.toString(), locale));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/travel-posts/${postId}/interest`, { method: "POST" });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not update interest."), locale));
      }

      setInterested(Boolean(data.interested));
      const nextInterestedCount = Number(data.interestedCount || 0);
      setCount(nextInterestedCount);
      onChange?.({
        interested: Boolean(data.interested),
        interestedCount: nextInterestedCount
      });
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? translateApiError(submissionError.message, locale)
          : translateApiError("Unexpected error.", locale)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`inline-flex w-full items-center justify-center rounded-full px-4 py-3 font-semibold shadow-card disabled:opacity-60 ${
          interested ? "bg-clay text-white" : "border border-ink/10 bg-white text-ink"
        }`}
      >
        {loading
          ? locale === "ar"
            ? "جارٍ التحديث..."
            : "Mise a jour..."
          : interested
            ? locale === "ar"
              ? `مهتم • ${count}`
              : `Interesse • ${count}`
            : locale === "ar"
              ? `أبدِ اهتمامك • ${count}`
              : `Je suis interesse • ${count}`}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
