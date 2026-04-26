"use client";

import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";
import { VerificationBadge } from "@/components/verification-badge";
import { buildLoginPath } from "@/lib/auth-flow";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { SiteLocale, translateApiError } from "@/lib/i18n";

type RentalItemCardProps = {
  item: {
    _id: string;
    title?: string;
    category?: string;
    city?: string;
    location?: string;
    size?: string;
    description?: string;
    price?: number;
    availabilityStatus?: "available" | "limited" | "unavailable";
    quantityAvailable?: number;
    images?: string[];
    renter?: {
      name?: string;
      city?: string;
      verificationStatus?: "unverified" | "pending" | "verified";
    };
  };
  locale?: SiteLocale;
  isSignedIn: boolean;
  authorizedTripId?: string;
};

export function RentalItemCard({ item, locale = "ar", isSignedIn, authorizedTripId }: RentalItemCardProps) {
  const [activeAction, setActiveAction] = useState<"request" | "whatsapp" | null>(null);
  const [tripCode, setTripCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const labels =
    locale === "ar"
      ? {
          perDay: "لليوم",
          size: "المقاس",
          availability: "التوفر",
          available: "متوفر",
          limited: "محدود",
          unavailable: "غير متوفر",
          request: "اطلب الآن",
          whatsapp: "واتساب",
          enterTripCode: "أدخل رمز الرحلة",
          unlockBody: "يبقى التصفح مفتوحاً، لكن التواصل وطلب الكراء يتطلبان رمز رحلة صالح.",
          cancel: "إلغاء",
          unlock: "تحقق",
          by: "بواسطة",
          noDescription: "معدات كراء جاهزة للحجز والتنسيق المباشر."
        }
      : {
          perDay: "/ jour",
          size: "Taille",
          availability: "Disponibilite",
          available: "Disponible",
          limited: "Limite",
          unavailable: "Indisponible",
          request: "Demander",
          whatsapp: "WhatsApp",
          enterTripCode: "Entrez votre code voyage",
          unlockBody: "La navigation reste ouverte, mais le contact et la demande exigent un code voyage valide.",
          cancel: "Annuler",
          unlock: "Verifier",
          by: "Par",
          noDescription: "Equipement location disponible avec coordination directe."
        };

  const images = Array.isArray(item.images) && item.images.length > 0
    ? item.images
    : ["/images/rent-gear.jpg"];
  const availabilityLabel =
    item.availabilityStatus === "limited"
      ? labels.limited
      : item.availabilityStatus === "unavailable"
        ? labels.unavailable
        : labels.available;

  function redirectToLogin() {
    setError(translateApiError("Please sign in to continue", locale));
    router.push(buildLoginPath(pathname, searchParams.toString(), locale));
  }

  async function unlockAction(nextAction = activeAction) {
    if (!isSignedIn) {
      redirectToLogin();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/rentals/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripCode: authorizedTripId ? undefined : tripCode,
          tripId: authorizedTripId,
          rentalItemId: item._id
        })
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Invalid trip code."), locale));
      }

      if (nextAction === "request" && data.phone) {
        window.location.href = `tel:${String(data.phone).replace(/\s+/g, "")}`;
      }

      if (nextAction === "whatsapp" && data.whatsapp) {
        const whatsappDigits = String(data.whatsapp).replace(/\D/g, "");

        if (whatsappDigits) {
          trackAnalyticsEvent("whatsapp_click", { surface: "rental_item", rental_item_id: item._id });
          window.open(`https://wa.me/${whatsappDigits}`, "_blank", "noopener,noreferrer");
        }
      }

      setTripCode("");
      setActiveAction(null);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : translateApiError("Unexpected error.", locale)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_18px_45px_rgba(15,61,46,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_60px_rgba(15,61,46,0.16)]">
      <div className="relative h-60 overflow-hidden bg-slate-100">
        <Image
          src={images[0] || "/images/rent-gear.jpg"}
          alt={item.title || "Rental item"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover object-center transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.05)_0%,rgba(15,61,46,0.2)_50%,rgba(0,0,0,0.72)_100%)] transition duration-500 group-hover:bg-[linear-gradient(180deg,rgba(15,23,42,0.12)_0%,rgba(15,61,46,0.28)_50%,rgba(0,0,0,0.82)_100%)]" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
            {item.category || "Gear"}
          </span>
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#0f3d2e] backdrop-blur-md">
            {availabilityLabel}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-2xl font-black leading-tight text-white">{item.title}</h3>
            <p className="mt-2 text-sm text-white/80">
              {labels.by} {item.renter?.name || "Renter"} {item.renter?.city ? `• ${item.renter.city}` : item.city ? `• ${item.city}` : ""}
            </p>
          </div>
          <div className="shrink-0 rounded-[1.25rem] bg-white/95 px-4 py-3 text-right shadow-sm">
            <p className="text-2xl font-black text-[#f97316]">{item.price || 0} DH</p>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/50">{labels.perDay}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <VerificationBadge type="renter" status={item.renter?.verificationStatus || "unverified"} locale={locale} />
          <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
            {labels.size}: {item.size || "-"}
          </span>
          <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
            {labels.availability}: {availabilityLabel}
            {typeof item.quantityAvailable === "number" ? ` • ${item.quantityAvailable}` : ""}
          </span>
        </div>

        <p className="line-clamp-3 text-sm leading-7 text-slate-600">{item.description || labels.noDescription}</p>

        <div className="mt-auto flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              if (!isSignedIn) {
                redirectToLogin();
                return;
              }

              trackAnalyticsEvent("booking_click", { surface: "rental_item", rental_item_id: item._id });
              if (authorizedTripId) {
                setActiveAction("request");
                setError("");
                void unlockAction("request");
                return;
              }

              setActiveAction("request");
              setError("");
            }}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-forest px-4 py-3 font-semibold text-white transition hover:bg-[#14533f]"
          >
            {labels.request}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!isSignedIn) {
                redirectToLogin();
                return;
              }

              trackAnalyticsEvent("whatsapp_click", { surface: "rental_item", rental_item_id: item._id });
              if (authorizedTripId) {
                setActiveAction("whatsapp");
                setError("");
                void unlockAction("whatsapp");
                return;
              }

              setActiveAction("whatsapp");
              setError("");
            }}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-ink/10 bg-white px-4 py-3 font-semibold text-ink transition hover:bg-slate-50"
          >
            {labels.whatsapp}
          </button>
        </div>
        {activeAction && !authorizedTripId ? (
          <div className="rounded-[1.5rem] border border-ink/10 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{labels.enterTripCode}</p>
            <p className="mt-1 text-xs text-slate-500">{labels.unlockBody}</p>
            <input
              value={tripCode}
              onChange={(event) => setTripCode(event.target.value.toUpperCase())}
              placeholder={labels.enterTripCode}
              className="mt-3 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-[#f97316]/40 focus:ring-4 focus:ring-[#f97316]/10"
            />
            {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  void unlockAction();
                }}
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-[#f97316] px-4 py-3 font-semibold text-white transition hover:bg-[#ea580c] disabled:opacity-60"
              >
                {labels.unlock}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveAction(null);
                  setTripCode("");
                  setError("");
                }}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-ink/10 bg-white px-4 py-3 font-semibold text-ink transition hover:bg-slate-50"
              >
                {labels.cancel}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
