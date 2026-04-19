"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";

export function ContactSellerForm({
  listingId,
  sellerId
}: {
  listingId: string;
  sellerId: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const conversationResponse = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, sellerId })
      });

      const conversationData = await parseApiResponse(conversationResponse);

      if (!conversationResponse.ok) {
        throw new Error(getApiError(conversationData, "Could not create conversation."));
      }

      const conversation = conversationData.conversation as { _id?: string } | undefined;

      if (!conversation?._id) {
        throw new Error("The server did not return the created conversation.");
      }

      const messageResponse = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversation._id,
          body: message
        })
      });

      const messageData = await parseApiResponse(messageResponse);

      if (!messageResponse.ok) {
        throw new Error(getApiError(messageData, "Could not send message."));
      }

      setMessage("");
      router.push(`/messages/${conversation._id}`);
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-[2rem] border border-ink/10 bg-white p-6 shadow-card">
      <h3 className="text-lg font-bold text-ink">Contact seller</h3>
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        rows={4}
        required
        placeholder="Hi, is this still available?"
        className="w-full rounded-2xl border border-ink/10 px-4 py-3 outline-none ring-clay/30 focus:ring"
      />
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-forest px-4 py-3 font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Opening chat..." : "Send message"}
      </button>
    </form>
  );
}
