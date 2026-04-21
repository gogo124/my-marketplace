"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";
import { resolveLocale, siteCopy } from "@/lib/i18n";

export function ContactSellerForm({
  listingId,
  sellerId,
  phoneNumber,
  whatsappNumber,
  locale
}: {
  listingId: string;
  sellerId: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  locale?: "ar" | "fr";
}) {
  const router = useRouter();
  const copy = siteCopy[resolveLocale(locale)];
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const safePhoneNumber = typeof phoneNumber === "string" ? phoneNumber.trim() : "";
  const safeWhatsappNumber = typeof whatsappNumber === "string" ? whatsappNumber.trim() : "";
  const normalizedPhone = safePhoneNumber.startsWith("+")
    ? `+${safePhoneNumber.slice(1).replace(/\D/g, "")}`
    : safePhoneNumber.replace(/\D/g, "");
  const normalizedWhatsapp = safeWhatsappNumber.startsWith("+")
    ? `+${safeWhatsappNumber.slice(1).replace(/\D/g, "")}`
    : safeWhatsappNumber.replace(/\D/g, "");
  const whatsappDigits = normalizedWhatsapp.replace(/\D/g, "");
  const phoneDigits = normalizedPhone.replace(/\D/g, "");

  async function trackLead(type: "whatsapp" | "call" | "chat") {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, sellerId, type })
    });

    const data = await parseApiResponse(response);

    if (!response.ok) {
      throw new Error(getApiError(data, "Could not track lead."));
    }
  }

  async function openWhatsapp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await trackLead("whatsapp");

      const text = encodeURIComponent(message || "Hi, is this still available?");
      window.open(`https://wa.me/${whatsappDigits}?text=${text}`, "_blank", "noopener,noreferrer");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  async function openCall(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await trackLead("call");
      window.open(`tel:${phoneDigits}`, "_self");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  async function openChat(event: FormEvent<HTMLFormElement>) {
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

      await trackLead("chat");

      const defaultBody = message || "Hi, is this still available?";

      const messageResponse = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversation._id,
          body: defaultBody
        })
      });

      const messageData = await parseApiResponse(messageResponse);

      if (!messageResponse.ok) {
        throw new Error(getApiError(messageData, "Could not send message."));
      }

      router.push(`/messages/${conversation._id}`);
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-3 rounded-[2rem] border border-ink/10 bg-white p-6 shadow-card">
      <h3 className="text-lg font-bold text-ink">Contact seller</h3>
      {safePhoneNumber ? <p className="text-sm text-ink/60">{safePhoneNumber}</p> : null}
      {safeWhatsappNumber ? <p className="text-sm text-ink/60">{safeWhatsappNumber}</p> : null}
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        rows={4}
        placeholder="Hi, is this still available?"
        className="w-full rounded-2xl border border-ink/10 px-4 py-3 outline-none ring-clay/30 focus:ring"
      />
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <div className="grid gap-3 md:grid-cols-3">
        <button
          type="button"
          onClick={(event) => openWhatsapp(event as unknown as FormEvent<HTMLFormElement>)}
          disabled={loading || !whatsappDigits}
          className="w-full rounded-2xl bg-forest px-4 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Opening..." : copy.contactAction}
        </button>
        <button
          type="button"
          onClick={(event) => openCall(event as unknown as FormEvent<HTMLFormElement>)}
          disabled={loading || !phoneDigits}
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 font-semibold text-ink disabled:opacity-60"
        >
          {loading ? "Opening..." : copy.callAction}
        </button>
        <button
          type="button"
          onClick={(event) => openChat(event as unknown as FormEvent<HTMLFormElement>)}
          disabled={loading}
          className="w-full rounded-2xl bg-clay px-4 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Opening..." : copy.chatAction}
        </button>
      </div>
    </form>
  );
}
