"use client";

import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";
import { VerificationBadge } from "@/components/verification-badge";
import { buildLoginPath } from "@/lib/auth-flow";
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
    : ["https://images.unsplash.com/photo-1517838277536-f5f99be501cd"];
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
    <article className="overflow-hidden rounded-[2rem] bg-white shadow-card">
      <div className="space-y-3 p-4">
        <div className="relative h-52 overflow-hidden rounded-[1.5rem] bg-sand">
          <Image
            src={images[0]}
            alt={item.title || "Rental item"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
        {images.length > 1 ? (
          <div className="grid grid-cols-4 gap-2">
            {images.slice(1, 5).map((image, index) => (
              <div key={`${item._id}-thumb-${index}`} className="relative h-16 overflow-hidden rounded-[1rem] bg-sand">
                <Image src={image} alt={item.title || "Rental item"} fill sizes="64px" className="object-cover" />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="space-y-4 px-5 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-clay">{item.category || "Gear"}</p>
            <h3 className="mt-2 text-2xl font-black text-ink">{item.title}</h3>
            <p className="mt-2 text-sm text-ink/55">
              {labels.by} {item.renter?.name || "Renter"} {item.renter?.city ? `• ${item.renter.city}` : item.city ? `• ${item.city}` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-clay">{item.price || 0} DH</p>
            <p className="text-sm text-ink/55">{labels.perDay}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <VerificationBadge type="renter" status={item.renter?.verificationStatus || "unverified"} locale={locale} />
          <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink">
            {labels.size}: {item.size || "-"}
          </span>
          <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink">
            {labels.availability}: {availabilityLabel}
            {typeof item.quantityAvailable === "number" ? ` • ${item.quantityAvailable}` : ""}
          </span>
        </div>

        <p className="line-clamp-3 text-sm leading-7 text-ink/70">{item.description || labels.noDescription}</p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              if (!isSignedIn) {
                redirectToLogin();
                return;
              }

              if (authorizedTripId) {
                setActiveAction("request");
                setError("");
                void unlockAction("request");
                return;
              }

              setActiveAction("request");
              setError("");
            }}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-forest px-4 py-3 font-semibold text-white"
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

              if (authorizedTripId) {
                setActiveAction("whatsapp");
                setError("");
                void unlockAction("whatsapp");
                return;
              }

              setActiveAction("whatsapp");
              setError("");
            }}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-ink/10 bg-white px-4 py-3 font-semibold text-ink"
          >
            {labels.whatsapp}
          </button>
        </div>
        {activeAction && !authorizedTripId ? (
          <div className="rounded-[1.5rem] border border-ink/10 bg-sand/40 p-4">
            <p className="text-sm font-semibold text-ink">{labels.enterTripCode}</p>
            <p className="mt-1 text-xs text-ink/60">{labels.unlockBody}</p>
            <input
              value={tripCode}
              onChange={(event) => setTripCode(event.target.value.toUpperCase())}
              placeholder={labels.enterTripCode}
              className="mt-3 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
            />
            {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  void unlockAction();
                }}
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-clay px-4 py-3 font-semibold text-white disabled:opacity-60"
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
                className="inline-flex flex-1 items-center justify-center rounded-full border border-ink/10 bg-white px-4 py-3 font-semibold text-ink"
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
