"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { getDirection, resolveLocale, siteCopy, SiteLocale, withLocale } from "@/lib/i18n";
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
      activityProviderStatus?: "none" | "pending" | "active" | "suspended" | "rejected";
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
  if (isActive) {
    return "rounded-full bg-clay px-4 py-2 text-center text-white shadow-card";
  }

  if (emphasize) {
    return "rounded-full bg-forest px-4 py-2 text-center text-white shadow-card";
  }

  return "rounded-full border border-ink/10 bg-white/80 px-4 py-2 text-center shadow-card";
}

function getNavigationLabel(labels: { ar: string; fr: string }, locale: SiteLocale) {
  return locale === "ar" ? labels.ar : labels.fr;
}

export function SiteHeader({ session }: SiteHeaderProps) {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const copy = siteCopy[locale];
  const [isOpen, setIsOpen] = useState(false);
  const canCreateAgency = Boolean(session?.user?.canCreateAgency);
  const canCreateRenter = Boolean(session?.user?.canCreateRenter);
  const isAdmin = session?.user?.role === "admin";
  const navigation = getNavigationForUser(session);
  const primaryNavigation = navigation.primary.map((item) => ({
    href: withLocale(item.href, locale),
    label: getNavigationLabel(item.label, locale),
    emphasize: item.emphasize
  }));
  const secondaryNavigation = navigation.secondary.map((item) => ({
    href: withLocale(item.href, locale),
    label: getNavigationLabel(item.label, locale)
  }));
  const utilityNavigation = navigation.utilities.map((item) => ({
    href: withLocale(item.href, locale),
    label: getNavigationLabel(item.label, locale)
  }));

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, searchParams]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="border-b border-forest/10 bg-[#0f3d2e] px-4 py-2 text-center text-xs font-semibold text-white/90 sm:px-6">
        {locale === "ar"
          ? "رفيق السفر، أماكن التخييم، المعدات والأنشطة في تجربة أوضح داخل المغرب"
          : "Travel partners, camping, gear and activities in a clearer Morocco outdoor experience"}
      </div>
      <div dir={getDirection(locale)} className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0 sm:gap-3">
            <Link
              href={withLocale("/", locale)}
              className="flex max-w-full items-center rounded-[1.25rem] border border-white/60 bg-white/70 px-2 py-1.5 shadow-card sm:px-3 sm:py-2"
            >
              <div className="relative h-8 w-[92px] sm:h-10 sm:w-[120px] md:h-11 md:w-[140px]">
                <Image
                  src="/logo.jpeg"
                  alt={copy.brand}
                  fill
                  priority
                  sizes="(max-width: 640px) 92px, (max-width: 768px) 120px, 140px"
                  className="object-contain"
                />
              </div>
            </Link>
            <div className="hidden items-center gap-2 rounded-full border border-ink/10 bg-sand/80 p-1 text-xs font-bold shadow-card sm:flex">
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
              <Link
                href={buildLink(pathname, "en", searchParams)}
                className={`rounded-full px-3 py-1.5 ${locale === "en" ? "bg-forest text-white" : "text-ink/60"}`}
              >
                EN
              </Link>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="shrink-0 rounded-full border border-ink/10 bg-white px-3 py-2 text-sm font-semibold text-ink shadow-card xl:hidden"
          >
            {isOpen ? (locale === "ar" ? "إغلاق" : "Fermer") : locale === "ar" ? "القائمة" : "Menu"}
          </button>
        </div>

        <div className={`${isOpen ? "flex" : "hidden"} flex-col gap-4 xl:flex xl:flex-row xl:items-center xl:justify-between`}>
          <nav className="flex flex-col gap-2 text-sm font-medium text-ink xl:flex-row xl:flex-wrap xl:items-center">
            {primaryNavigation.map((item, index) => (
              <Link
                key={`${item.href}-${item.label}-${index}`}
                href={item.href}
                className={`${getNavLinkClass(pathname === item.href.split("?")[0], item.emphasize)} w-full xl:w-auto`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex min-w-0 flex-col gap-2 xl:flex-row xl:flex-wrap xl:items-center xl:justify-end">
            <div className="flex items-center gap-2 rounded-full border border-ink/10 bg-sand/80 p-1 text-xs font-bold shadow-card sm:hidden self-start">
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
              <Link
                href={buildLink(pathname, "en", searchParams)}
                className={`rounded-full px-3 py-1.5 ${locale === "en" ? "bg-forest text-white" : "text-ink/60"}`}
              >
                EN
              </Link>
            </div>
            {session?.user ? (
              <>
                {secondaryNavigation.length > 0 ? (
                  <div className="flex flex-col gap-2 xl:flex-row xl:flex-wrap">
                    {secondaryNavigation.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`${getNavLinkClass(pathname === item.href.split("?")[0] || pathname.startsWith(item.href.split("?")[0]))} w-full xl:w-auto`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
                {utilityNavigation.length > 0 ? (
                  <div className="flex flex-col gap-2 xl:flex-row xl:flex-wrap">
                    {utilityNavigation.map((item) => (
                      <Link key={item.href} href={item.href} className="w-full rounded-full border border-ink/10 bg-white/80 px-4 py-2 text-center shadow-card xl:w-auto">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
                {canCreateAgency ? (
                  <Link href={withLocale("/agency/profile", locale)} className="w-full rounded-full bg-forest px-4 py-2 text-center text-white shadow-card xl:w-auto">
                    {copy.becomeAgency}
                  </Link>
                ) : null}
                {canCreateRenter ? (
                  <Link href={withLocale("/renter/profile", locale)} className="w-full rounded-full border border-ink/10 bg-white/80 px-4 py-2 text-center shadow-card xl:w-auto">
                    {locale === "ar" ? "أنشئ ملف كراء" : locale === "fr" ? "Creer un profil location" : "Create rental profile"}
                  </Link>
                ) : null}
                {isAdmin ? (
                  <Link href={withLocale("/admin", locale)} className={`${getNavLinkClass(pathname.startsWith("/admin"))} w-full xl:w-auto`}>
                    {copy.admin}
                  </Link>
                ) : null}
                <span className="max-w-full truncate px-2 text-sm text-ink/70 xl:max-w-[180px]">{session.user.name}</span>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: withLocale("/", locale) })}
                  className="w-full rounded-full bg-forest px-4 py-2 text-white shadow-card xl:w-auto"
                >
                  {copy.signOut}
                </button>
              </>
            ) : (
              <>
                <Link href={withLocale("/login", locale)} className={`${getNavLinkClass(pathname === "/login")} w-full xl:w-auto`}>
                  {copy.login}
                </Link>
                <Link href={withLocale("/travel-partners", locale)} className="w-full rounded-full border border-forest/20 bg-sand/70 px-4 py-2 text-center font-semibold text-forest shadow-card xl:w-auto">
                  {locale === "ar" ? "ابحث عن رفيق" : locale === "fr" ? "Trouver un partenaire" : "Find a partner"}
                </Link>
                <Link href={withLocale("/register", locale)} className="w-full rounded-full bg-forest px-4 py-2 text-center text-white shadow-card xl:w-auto">
                  {locale === "ar" ? "ابدأ الآن" : locale === "fr" ? "Creer un compte" : "Create account"}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
