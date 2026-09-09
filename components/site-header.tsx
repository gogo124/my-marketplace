"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { getDirection, marketingCopy, resolveLocale, siteCopy, SiteLocale, withLocale } from "@/lib/i18n";
import { getNavigationForUser } from "@/lib/navigation";

type SiteHeaderProps = {
  session: {
    user?: {
      name?: string | null;
      role?: "user" | "agency" | "renter" | "admin";
      canCreateAgency?: boolean;
      canCreateRenter?: boolean;
      sellerStatus?: "none" | "pending" | "active" | "expired" | "suspended" | "rejected";
      sellerExpiresAt?: string | null;
    } | null;
  } | null;
};

function buildLink(pathname: string, nextLocale: SiteLocale, searchParams: URLSearchParams) {
  const params = new URLSearchParams(searchParams.toString());
  params.set("lang", nextLocale);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function getNavLinkClass(isActive: boolean, emphasize = false) {
  if (isActive) return "rounded-full border border-emerald-900 bg-emerald-900 px-4 py-2 text-center text-white shadow-card";
  if (emphasize) return "rounded-full border border-emerald-100 bg-white/80 px-4 py-2 text-center text-emerald-950 shadow-card";
  return "rounded-full border border-emerald-100 bg-white/80 px-4 py-2 text-center text-emerald-950 shadow-card";
}

function getNavigationLabel(labels: { ar: string; fr: string; en?: string }, locale: SiteLocale) {
  if (locale === "ar") return labels.ar;
  if (locale === "en") return labels.en || labels.fr;
  return labels.fr;
}

function resolveNavItemLabel(item: { href: string; label?: string; fallback?: string }, locale: SiteLocale) {
  const currentLang = locale;
  const baseHref = item.href.split("?")[0];
  return item.label || item.fallback || (baseHref === "/travel-partners" ? currentLang === "ar" ? "رفيق سفر" : currentLang === "fr" ? "Partenaire de voyage" : "Travel Partner" : "");
}

export function SiteHeader({ session }: SiteHeaderProps) {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const copy = siteCopy[locale];
  const marketing = marketingCopy[locale];
  const [isOpen, setIsOpen] = useState(false);
  const canCreateAgency = Boolean(session?.user?.canCreateAgency);
  const canCreateRenter = Boolean(session?.user?.canCreateRenter);
  const isAdmin = session?.user?.role === "admin";
  const navigation = getNavigationForUser(session);
  const publicNavigation = [
    { href: withLocale("/travel-partners", locale), label: marketing.publicNav.travelPartners, fallback: marketing.publicNav.travelPartners, emphasize: true },
    { href: withLocale("/camping", locale), label: marketing.publicNav.camping, fallback: marketing.publicNav.camping },
    { href: withLocale("/marketplace", locale), label: marketing.publicNav.marketplace, fallback: marketing.publicNav.marketplace },
    { href: withLocale("/activities", locale), label: marketing.publicNav.activities, fallback: marketing.publicNav.activities },
    { href: withLocale("/destinations", locale), label: locale === "ar" ? "الوجهات" : "Destinations", fallback: locale === "ar" ? "الوجهات" : "Destinations" },
    { href: withLocale("/about", locale), label: marketing.publicNav.about, fallback: marketing.publicNav.about },
    { href: withLocale("/contact", locale), label: marketing.publicNav.contact, fallback: marketing.publicNav.contact }
  ];
  const primaryNavigation = publicNavigation.map((item) => ({ ...item, label: resolveNavItemLabel(item, locale) }));
  const secondaryNavigation = navigation.secondary.map((item) => ({ href: withLocale(item.href, locale), label: getNavigationLabel(item.label, locale) }));
  const utilityNavigation = navigation.utilities.map((item) => ({ href: withLocale(item.href, locale), label: getNavigationLabel(item.label, locale) }));

  useEffect(() => { setIsOpen(false); }, [pathname, searchParams]);

  return (
    <header className="sticky top-0 z-40">
      <div className="border-b border-white/10 bg-[#0b2b22] px-4 py-2 text-center text-[11px] font-semibold tracking-[0.08em] text-white/90 sm:px-6 sm:text-xs">{marketing.announcement}</div>
      <div className="border-b border-forest/10 bg-[rgba(248,250,249,0.82)] backdrop-blur-xl">
        <div dir={getDirection(locale)} className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <Link href={withLocale("/", locale)} className="flex max-w-full items-center rounded-[1.4rem] border border-white/70 bg-white/90 px-2 py-1.5 shadow-[0_16px_35px_rgba(15,61,46,0.1)] sm:px-3 sm:py-2">
                <div className="relative h-8 w-[92px] sm:h-10 sm:w-[120px] md:h-11 md:w-[140px]"><Image src="/logo.jpeg" alt={copy.brand} fill priority sizes="(max-width: 640px) 92px, (max-width: 768px) 120px, 140px" className="object-contain" /></div>
              </Link>
              <div className="hidden items-center gap-1 rounded-full border border-forest/10 bg-white/80 p-1 text-xs font-bold shadow-[0_12px_30px_rgba(15,61,46,0.08)] sm:flex">
                <Link href={buildLink(pathname, "ar", searchParams)} className={`rounded-full px-3 py-1.5 ${locale === "ar" ? "bg-forest text-white" : "text-ink/60 hover:bg-sand/80"}`}>AR</Link>
                <Link href={buildLink(pathname, "fr", searchParams)} className={`rounded-full px-3 py-1.5 ${locale === "fr" ? "bg-forest text-white" : "text-ink/60 hover:bg-sand/80"}`}>FR</Link>
                <Link href={buildLink(pathname, "en", searchParams)} className={`rounded-full px-3 py-1.5 ${locale === "en" ? "bg-forest text-white" : "text-ink/60 hover:bg-sand/80"}`}>EN</Link>
              </div>
            </div>
            <button type="button" onClick={() => setIsOpen((current) => !current)} className="shrink-0 rounded-full border border-forest/10 bg-white px-3 py-2 text-sm font-semibold text-ink shadow-[0_12px_30px_rgba(15,61,46,0.08)] xl:hidden">{isOpen ? marketing.close : marketing.menu}</button>
          </div>

          <div className={`${isOpen ? "flex" : "hidden"} flex-col gap-4 xl:flex xl:flex-row xl:items-center xl:justify-between`}>
            <nav className="flex flex-col gap-2 text-sm font-medium text-ink xl:flex-row xl:flex-wrap xl:items-center">
              {primaryNavigation.map((item, index) => <Link key={`${item.href}-${item.label}-${index}`} href={item.href} className={`${getNavLinkClass(pathname === item.href.split("?")[0], item.emphasize)} w-full xl:w-auto`}><span className="text-inherit">{item.label}</span></Link>)}
            </nav>

            <div className="flex min-w-0 flex-col gap-2 xl:flex-row xl:flex-wrap xl:items-center xl:justify-end">
              <div className="self-start flex items-center gap-1 rounded-full border border-forest/10 bg-white/80 p-1 text-xs font-bold shadow-[0_12px_30px_rgba(15,61,46,0.08)] sm:hidden">
                <Link href={buildLink(pathname, "ar", searchParams)} className={`rounded-full px-3 py-1.5 ${locale === "ar" ? "bg-forest text-white" : "text-ink/60 hover:bg-sand/80"}`}>AR</Link>
                <Link href={buildLink(pathname, "fr", searchParams)} className={`rounded-full px-3 py-1.5 ${locale === "fr" ? "bg-forest text-white" : "text-ink/60 hover:bg-sand/80"}`}>FR</Link>
                <Link href={buildLink(pathname, "en", searchParams)} className={`rounded-full px-3 py-1.5 ${locale === "en" ? "bg-forest text-white" : "text-ink/60 hover:bg-sand/80"}`}>EN</Link>
              </div>
              {session?.user ? <>
                {secondaryNavigation.length > 0 ? <div className="flex flex-col gap-2 xl:flex-row xl:flex-wrap">{secondaryNavigation.map((item) => <Link key={item.href} href={item.href} className={`${getNavLinkClass(pathname === item.href.split("?")[0] || pathname.startsWith(item.href.split("?")[0]))} w-full xl:w-auto`}><span className="text-inherit">{item.label}</span></Link>)}</div> : null}
                {utilityNavigation.length > 0 ? <div className="flex flex-col gap-2 xl:flex-row xl:flex-wrap">{utilityNavigation.map((item) => <Link key={item.href} href={item.href} className="w-full rounded-full border border-emerald-100 bg-white/80 px-4 py-2 text-center text-emerald-950 shadow-card xl:w-auto"><span className="text-inherit">{item.label}</span></Link>)}</div> : null}
                {canCreateAgency ? <Link href={withLocale("/agency/profile", locale)} className="w-full rounded-full border border-emerald-900 bg-emerald-900 px-4 py-2 text-center text-white shadow-card xl:w-auto">{copy.becomeAgency}</Link> : null}
                {canCreateRenter ? <Link href={withLocale("/renter/profile", locale)} className="w-full rounded-full border border-emerald-100 bg-white/80 px-4 py-2 text-center text-emerald-950 shadow-card xl:w-auto">{locale === "ar" ? "أنشئ ملف كراء" : locale === "fr" ? "Creer un profil location" : "Create rental profile"}</Link> : null}
                {isAdmin ? <Link href={withLocale("/admin", locale)} className={`${getNavLinkClass(pathname.startsWith("/admin"))} w-full xl:w-auto`}>{copy.admin}</Link> : null}
                <span className="max-w-full truncate px-2 text-sm text-ink/70 xl:max-w-[180px]">{session.user.name}</span>
                <button type="button" onClick={() => signOut({ callbackUrl: withLocale("/", locale) })} className="w-full rounded-full bg-forest px-4 py-2 text-white shadow-card xl:w-auto">{copy.signOut}</button>
              </> : <>
                <Link href={withLocale("/login", locale)} className={`${getNavLinkClass(pathname === "/login")} w-full xl:w-auto`}><span className="text-inherit">{copy.login}</span></Link>
                <Link href={withLocale("/register", locale)} className="w-full rounded-full border border-emerald-900 bg-emerald-900 px-4 py-2 text-center font-semibold text-white shadow-[0_16px_35px_rgba(249,115,22,0.28)] xl:w-auto"><span className="text-inherit">{copy.register}</span></Link>
              </>}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
