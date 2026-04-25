"use client";

import Image from "next/image";
import { MouseEvent, useState } from "react";
import { ReportForm } from "@/components/report-form";
import { TravelPostInterestButton } from "@/components/travel-post-interest-button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildLoginPath } from "@/lib/auth-flow";
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
  const coverImage = post.coverImage || "";
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
    <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-card backdrop-blur transition hover:-translate-y-1">
      {coverImage ? (
        <div className="relative -mx-6 -mt-6 mb-5 h-48 overflow-hidden">
          <Image src={coverImage} alt={destination} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,24,39,0.08),rgba(17,24,39,0.55))]" />
          <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/70">{copy.destination}</p>
              <h3 className="mt-2 truncate text-2xl font-black text-white">{destination}</h3>
            </div>
            <div className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-forest">
              {formattedDate}
            </div>
          </div>
        </div>
      ) : null}
      <div className="absolute inset-x-6 top-0 h-20 rounded-b-[2rem] bg-[radial-gradient(circle,rgba(184,138,68,0.14),transparent_70%)]" />
      <div className="space-y-4">
        {!coverImage ? (
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-clay">
                {copy.destination}
              </p>
              <h3 className="mt-2 text-2xl font-black leading-tight text-ink">{destination}</h3>
            </div>
            <div className="rounded-full bg-sand px-4 py-2 text-sm font-semibold text-forest">
              {formattedDate}
            </div>
          </div>
        ) : null}
        <p className="line-clamp-4 text-sm leading-7 text-ink/70">{description}</p>
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">
          <span>{formattedDate}</span>
          {genderLabel ? <span>{genderLabel}</span> : null}
          <span>{interestedCount} {locale === "ar" ? "مهتم" : "interesses"}</span>
        </div>
      </div>

      <div className="mt-6 space-y-4 border-t border-ink/10 pt-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border border-ink/10 bg-sand">
            {profileImage ? (
              <Image src={profileImage} alt={user?.name || "Traveler"} fill sizes="48px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-forest text-sm font-bold text-white">
                {user?.name?.slice(0, 1).toUpperCase() || "M"}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink/45">{copy.postedBy}</p>
            <p className="font-semibold text-ink">{user?.name || "Moroccan Trip"}</p>
            {genderLabel ? <p className="text-sm text-ink/55">{genderLabel}</p> : null}
            <p className="text-sm text-ink/55">{normalizedPhone || "-"}</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
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
            onClick={requireSignIn}
            aria-disabled={!whatsappDigits}
            className="inline-flex w-full items-center justify-center rounded-full bg-forest px-4 py-3 font-semibold text-white shadow-card disabled:opacity-60"
          >
            {copy.contactAction}
          </a>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href={phoneDigits ? `tel:${phoneDigits}` : "#"}
            onClick={requireSignIn}
            aria-disabled={!phoneDigits}
            className="inline-flex w-full items-center justify-center rounded-full bg-clay px-4 py-3 font-semibold text-white shadow-card disabled:opacity-60"
          >
            {copy.callAction}
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
