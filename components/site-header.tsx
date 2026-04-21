"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { resolveLocale, siteCopy, withLocale } from "@/lib/i18n";

type SiteHeaderProps = {
  session: {
    user?: {
      name?: string | null;
      role?: "user" | "agency";
    } | null;
  } | null;
};

function buildLink(pathname: string, nextLocale: "ar" | "fr", searchParams: URLSearchParams) {
  const params = new URLSearchParams(searchParams.toString());
  params.set("lang", nextLocale);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function SiteHeader({ session }: SiteHeaderProps) {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const copy = siteCopy[locale];

  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href={withLocale("/", locale)} className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-forest text-sm font-black uppercase tracking-[0.2em] text-white shadow-card">
              MT
            </span>
            <span className="text-xl font-black tracking-[0.08em] text-forest sm:text-2xl">
              {copy.brand}
            </span>
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-ink/10 bg-sand/80 p-1 text-xs font-bold shadow-card">
            <Link
              href={buildLink(pathname, "ar", searchParams)}
              className={`rounded-full px-3 py-1.5 ${locale === "ar" ? "bg-forest text-white" : "text-ink/60"}`}
            >
              AR
            </Link>
            <Link
              href={buildLink(pathname, "fr", searchParams)}
              className={`rounded-full px-3 py-1.5 ${locale === "fr" ? "bg-forest text-white" : "text-ink/60"}`}
            >
              FR
            </Link>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-ink">
          <Link href={withLocale("/travel-partners", locale)} className="rounded-full border border-ink/10 bg-white/80 px-4 py-2 shadow-card">
            {copy.travelPartners}
          </Link>
          <Link href={withLocale("/listings/new", locale)} className="rounded-full bg-clay px-4 py-2 text-white shadow-card">
            {copy.sell}
          </Link>
          <Link href={withLocale("/rentals/new", locale)} className="rounded-full border border-ink/10 bg-white/80 px-4 py-2 shadow-card">
            {copy.rent}
          </Link>
          {session?.user ? (
            <>
              <Link href={withLocale("/agency/dashboard", locale)} className="rounded-full border border-ink/10 bg-white/80 px-4 py-2 shadow-card">
                Agency
              </Link>
              <Link href={withLocale("/messages", locale)} className="rounded-full border border-ink/10 bg-white/80 px-4 py-2 shadow-card">
                {copy.messages}
              </Link>
              <span className="hidden text-ink/70 sm:inline">{session.user.name}</span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: withLocale("/", locale) })}
                className="rounded-full bg-forest px-4 py-2 text-white shadow-card"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href={withLocale("/login", locale)} className="rounded-full border border-ink/10 bg-white/80 px-4 py-2 shadow-card">
                {copy.login}
              </Link>
              <Link href={withLocale("/register", locale)} className="rounded-full bg-forest px-4 py-2 text-white shadow-card">
                {copy.register}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
