"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";
import { resolveLocale, translateApiError } from "@/lib/i18n";

export function ReviewReplyForm({
  reviewId,
  initialReply = ""
}: {
  reviewId: string;
  initialReply?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const [reply, setReply] = useState(initialReply);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, providerReply: reply })
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not update review."), locale));
      }

      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : translateApiError("Unexpected error.", locale));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded-[1.25rem] bg-sand/35 p-4">
      <textarea
        value={reply}
        onChange={(event) => setReply(event.target.value)}
        rows={3}
        placeholder={locale === "ar" ? "أضف رد المزود" : "Ajouter une reponse du fournisseur"}
        className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button type="submit" disabled={loading} className="rounded-full bg-clay px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {loading ? (locale === "ar" ? "جارٍ الحفظ..." : "Enregistrement...") : locale === "ar" ? "حفظ الرد" : "Enregistrer la reponse"}
      </button>
    </form>
  );
}

