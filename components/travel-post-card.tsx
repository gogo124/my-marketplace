"use client";

import Image from "next/image";
import { MouseEvent, useState } from "react";
import { ReportForm } from "@/components/report-form";
import { TravelPostInterestButton } from "@/components/travel-post-interest-button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildLoginPath } from "@/lib/auth-flow";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { formatLocaleDate, localizeRecordField, siteCopy, translateApiError } from "@/lib/i18n";

type TravelPostCardProps = {
  locale: "ar" | "fr";
  canReport?: boolean;
  isSignedIn: boolean;
  post: {
    _id: string;
    destination: string;
    date: string;
    description: string;
    phoneNumber: string;
    gender?: "male" | "female" | "ذكر" | "أنثى";
    profileImage?: string;
    coverImage?: string;
    interestedCount?: number;
    isInterested?: boolean;
    userId?: {
      _id?: string;
      name?: string;
      avatar?: string;
    };
  };
};

export function TravelPostCard({ locale, canReport = false, isSignedIn, post }: TravelPostCardProps) {
  const copy = siteCopy[locale];
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = post.userId;
  const normalizedPhone = typeof post.phoneNumber === "string" ? post.phoneNumber.trim() : "";
  const phoneDigits = normalizedPhone.startsWith("+")
    ? `+${normalizedPhone.slice(1).replace(/\D/g, "")}`
    : normalizedPhone.replace(/\D/g, "");
  const whatsappDigits = phoneDigits.replace(/\D/g, "");
  const formattedDate = formatLocaleDate(post.date, locale, { dateStyle: "medium" });
  const destination = localizeRecordField(post as Record<string, any>, "destination", locale, post.destination);
  const description = localizeRecordField(post as Record<string, any>, "description", locale, post.description);
  const [authError, setAuthError] = useState("");
  const genderLabel =
    post.gender === "female" || post.gender === "أنثى"
      ? locale === "ar"
        ? "أنثى"
        : "Female"
      : post.gender === "male" || post.gender === "ذكر"
        ? locale === "ar"
          ? "ذكر"
          : "Male"
        : "";
  const profileImage = post.profileImage || "";
  const coverImage = post.coverImage || "/images/travel-partner.jpg";
  const [isInterested, setIsInterested] = useState(Boolean(post.isInterested));
  const [interestedCount, setInterestedCount] = useState(Number(post.interestedCount || 0));

  function requireSignIn(event: MouseEvent<HTMLAnchorElement>) {
    if (isSignedIn) {
      return;
    }

    event.preventDefault();
    setAuthError(translateApiError("Please sign in to continue", locale));
    router.push(buildLoginPath(pathname, searchParams.toString(), locale));
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-white/95 shadow-[0_18px_45px_rgba(15,61,46,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_60px_rgba(15,61,46,0.16)]">
      <div className="relative h-56 overflow-hidden">
        <Image src={coverImage} alt={destination} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover object-center transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,61,46,0.2)_45%,rgba(0,0,0,0.76)_100%)] transition duration-500 group-hover:bg-[linear-gradient(180deg,rgba(15,23,42,0.12)_0%,rgba(15,61,46,0.32)_45%,rgba(0,0,0,0.84)_100%)]" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
            {copy.destination}
          </span>
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#0f3d2e] backdrop-blur-md">
            {formattedDate}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-2xl font-black leading-tight text-white">{destination}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-white/80">{description}</p>
          </div>
          <div className="relative h-14 w-14 overflow-hidden rounded-full border border-white/40 bg-white/20 backdrop-blur">
            {profileImage ? (
              <Image src={profileImage} alt={user?.name || "Traveler"} fill sizes="56px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/15 text-lg font-black text-white">
                {user?.name?.slice(0, 1).toUpperCase() || "M"}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          <span className="rounded-full bg-slate-50 px-3 py-1">{formattedDate}</span>
          {genderLabel ? <span className="rounded-full bg-slate-50 px-3 py-1">{genderLabel}</span> : null}
          <span className="rounded-full bg-slate-50 px-3 py-1">
            {interestedCount} {locale === "ar" ? "مهتم" : "interesses"}
          </span>
        </div>

        <div className="flex items-center gap-3 rounded-[1.4rem] bg-slate-50 p-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border border-ink/10 bg-sand">
            {profileImage ? (
              <Image src={profileImage} alt={user?.name || "Traveler"} fill sizes="48px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-forest text-sm font-bold text-white">
                {user?.name?.slice(0, 1).toUpperCase() || "M"}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/45">{copy.postedBy}</p>
            <p className="truncate font-semibold text-ink">{user?.name || "Moroccan Trip"}</p>
            <p className="text-sm text-ink/55">{normalizedPhone || "-"}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">{copy.destination}</span>
          <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
            {locale === "ar" ? "تواصل آمن" : "Contact securise"}
          </span>
          <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
            {locale === "ar" ? "هدف الرحلة واضح" : "Intention claire"}
          </span>
        </div>

        <div className="mt-auto grid gap-3 sm:grid-cols-2">
          <TravelPostInterestButton
            postId={post._id}
            initialInterested={isInterested}
            initialCount={interestedCount}
            isSignedIn={isSignedIn}
            onChange={({ interested, interestedCount: nextInterestedCount }) => {
              setIsInterested(interested);
              setInterestedCount(nextInterestedCount);
            }}
          />
          <a
            href={whatsappDigits ? `https://wa.me/${whatsappDigits}` : "#"}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => {
              requireSignIn(event);
              if (whatsappDigits && isSignedIn) {
                trackAnalyticsEvent("whatsapp_click", { surface: "travel_partner", post_id: post._id });
              }
            }}
            aria-disabled={!whatsappDigits}
            className="inline-flex w-full items-center justify-center rounded-full bg-forest px-4 py-3 font-semibold text-white shadow-card transition hover:bg-[#14533f] disabled:opacity-60"
          >
            {locale === "ar" ? "تواصل عبر واتساب" : "Contacter sur WhatsApp"}
          </a>
          <a
            href={phoneDigits ? `tel:${phoneDigits}` : "#"}
            onClick={requireSignIn}
            aria-disabled={!phoneDigits}
            className="inline-flex w-full items-center justify-center rounded-full border border-ink/10 bg-white px-4 py-3 font-semibold text-ink transition hover:bg-slate-50 disabled:opacity-60 sm:col-span-2"
          >
            {locale === "ar" ? "اتصال سريع" : "Appeler"}
          </a>
        </div>

        {authError ? <p className="text-sm font-medium text-red-600">{authError}</p> : null}
        {canReport ? (
          <div className="flex flex-wrap gap-3">
            <ReportForm targetType="travel-post" targetId={post._id} title={copy.reportPost} compact locale={locale} />
            {user?._id ? <ReportForm targetType="user" targetId={user._id} title={copy.reportUser} compact locale={locale} /> : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
