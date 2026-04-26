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
    <form onSubmit={handleSubmit} className="space-y-3 rounded-[2rem] border border-slate-100 bg-white p-4 shadow-[0_12px_34px_rgba(15,61,46,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">{copy.writeReply}</p>
        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
          {copy.sendReply}
        </span>
      </div>
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={4}
        required
        placeholder={copy.writeReply}
        className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-[#f97316]/20 placeholder:text-slate-400 focus:ring-2"
      />
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex rounded-full bg-[#0f3d2e] px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {loading ? copy.sending : copy.sendReply}
      </button>
    </form>
  );
}
