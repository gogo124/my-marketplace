"use client";

import { FormEvent, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildLoginPath } from "@/lib/auth-flow";
import { getApiError, parseApiResponse } from "@/lib/api";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { resolveLocale, siteCopy, translateApiError, withLocale } from "@/lib/i18n";
import { isValidPhoneNumber } from "@/lib/validation";

export function ContactSellerForm({
  listingId,
  listingTitle,
  sellerId,
  phoneNumber,
  whatsappNumber,
  locale
}: {
  listingId: string;
  listingTitle?: string;
  sellerId: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  locale?: "ar" | "fr";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const safeLocale = resolveLocale(locale);
  const copy = siteCopy[safeLocale];
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
  const safeListingTitle = typeof listingTitle === "string" ? listingTitle.trim() : "";

  function buildInitialMessage() {
    const baseMessage = message.trim() || copy.defaultSellerMessage;

    if (!safeListingTitle) {
      return baseMessage;
    }

    return safeLocale === "ar"
      ? `Moroccan Trip\nالمنتج: ${safeListingTitle}\n${baseMessage}`
      : `Moroccan Trip\nProduit : ${safeListingTitle}\n${baseMessage}`;
  }

  async function trackLead(type: "whatsapp" | "call" | "chat") {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId,
        sellerId,
        type,
        source: "listing",
        message:
          type === "whatsapp" && safeListingTitle
            ? safeLocale === "ar"
              ? `WhatsApp click for ${safeListingTitle}`
              : `Clic WhatsApp pour ${safeListingTitle}`
            : ""
      })
    });

    const data = await parseApiResponse(response);

    if (!response.ok) {
      throw new Error(translateApiError(getApiError(data, "Unexpected error."), safeLocale));
    }
  }

  function redirectToLogin() {
    setError(translateApiError("Please sign in to continue", safeLocale));
    router.push(buildLoginPath(pathname, searchParams.toString(), safeLocale));
  }

  async function openWhatsapp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!whatsappDigits || !isValidPhoneNumber(whatsappDigits)) {
        throw new Error(translateApiError("WhatsApp number is not available for this listing.", safeLocale));
      }

      trackAnalyticsEvent("whatsapp_click", { surface: "listing_contact", listing_id: listingId });
      await trackLead("whatsapp");

      const text = encodeURIComponent(buildInitialMessage());
      window.open(`https://wa.me/${whatsappDigits}?text=${text}`, "_blank", "noopener,noreferrer");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? translateApiError(submissionError.message, safeLocale) : translateApiError("Unexpected error.", safeLocale)
      );
    } finally {
      setLoading(false);
    }
  }

  async function openCall(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!phoneDigits || !isValidPhoneNumber(phoneDigits)) {
        throw new Error(translateApiError("Phone number is not available for this listing.", safeLocale));
      }

      await trackLead("call");
      window.open(`tel:${phoneDigits}`, "_self");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? translateApiError(submissionError.message, safeLocale) : translateApiError("Unexpected error.", safeLocale)
      );
    } finally {
      setLoading(false);
    }
  }

  async function openChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (message.trim().length > 500) {
        throw new Error(translateApiError("Message is too long.", safeLocale));
      }

      const conversationResponse = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, sellerId })
      });

      const conversationData = await parseApiResponse(conversationResponse);

      if (!conversationResponse.ok) {
        if (conversationResponse.status === 401) {
          redirectToLogin();
          return;
        }

        throw new Error(translateApiError(getApiError(conversationData, "Could not create conversation."), safeLocale));
      }

      const conversation = conversationData.conversation as { _id?: string } | undefined;

      if (!conversation?._id) {
        throw new Error(translateApiError("The server did not return the created conversation.", safeLocale));
      }

      await trackLead("chat");

      const defaultBody = buildInitialMessage();

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
        if (messageResponse.status === 401) {
          redirectToLogin();
          return;
        }

        throw new Error(translateApiError(getApiError(messageData, "Could not send message."), safeLocale));
      }

      router.push(withLocale(`/messages/${conversation._id}`, safeLocale));
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? translateApiError(submissionError.message, safeLocale) : translateApiError("Unexpected error.", safeLocale)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-3 rounded-[2rem] border border-ink/10 bg-white p-6 shadow-card">
      <h3 className="text-lg font-bold text-ink">{copy.contactSeller}</h3>
      {safePhoneNumber ? <p className="text-sm text-ink/60">{safePhoneNumber}</p> : null}
      {safeWhatsappNumber ? <p className="text-sm text-ink/60">{safeWhatsappNumber}</p> : null}
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        rows={4}
        placeholder={buildInitialMessage()}
        className="w-full rounded-2xl border border-ink/10 px-4 py-3 outline-none ring-clay/30 focus:ring"
      />
      <p className="text-xs text-ink/50">{copy.contactSellerBody}</p>
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <div className="grid gap-3 md:grid-cols-3">
        <button
          type="button"
          onClick={(event) => openWhatsapp(event as unknown as FormEvent<HTMLFormElement>)}
        disabled={loading || !whatsappDigits}
        className="w-full rounded-2xl bg-forest px-4 py-3 font-semibold text-white disabled:opacity-60"
      >
          {loading ? copy.loading : copy.contactAction}
        </button>
        <button
          type="button"
          onClick={(event) => openCall(event as unknown as FormEvent<HTMLFormElement>)}
        disabled={loading || !phoneDigits}
        className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 font-semibold text-ink disabled:opacity-60"
      >
          {loading ? copy.loading : copy.callAction}
        </button>
        <button
          type="button"
          onClick={(event) => openChat(event as unknown as FormEvent<HTMLFormElement>)}
        disabled={loading}
        className="w-full rounded-2xl bg-clay px-4 py-3 font-semibold text-white disabled:opacity-60"
      >
          {loading ? copy.loading : copy.chatAction}
      </button>
      </div>
    </form>
  );
}
