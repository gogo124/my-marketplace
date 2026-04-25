"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";
import { resolveLocale, siteCopy, translateApiError } from "@/lib/i18n";

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const copy = siteCopy[locale];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, body })
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Message send failed."), locale));
      }

      setBody("");
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? translateApiError(submissionError.message, locale) : translateApiError("Unexpected error.", locale)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-[2rem] border border-ink/10 bg-white p-4 shadow-card">
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={3}
        required
        placeholder={copy.writeReply}
        className="w-full rounded-2xl border border-ink/10 px-4 py-3 outline-none ring-clay/30 focus:ring"
      />
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="rounded-2xl bg-clay px-5 py-3 font-semibold text-white disabled:opacity-60"
      >
        {loading ? copy.sending : copy.sendReply}
      </button>
    </form>
  );
}
