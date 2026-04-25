"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { getDirection, resolveLocale, siteCopy, withLocale } from "@/lib/i18n";

type SiteHeaderProps = {
  session: {
    user?: {
      name?: string | null;
      role?: "user" | "agency" | "renter" | "admin";
      canCreateAgency?: boolean;
      canCreateRenter?: boolean;
    } | null;
  } | null;
};

function buildLink(pathname: string, nextLocale: "ar" | "fr", searchParams: URLSearchParams) {
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

export function SiteHeader({ session }: SiteHeaderProps) {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const copy = siteCopy[locale];
  const [isOpen, setIsOpen] = useState(false);
  const isAgency = session?.user?.role === "agency";
  const isRenter = session?.user?.role === "renter";
  const isAdmin = session?.user?.role === "admin";
  const canCreateAgency = Boolean(session?.user?.canCreateAgency);
  const canCreateRenter = Boolean(session?.user?.canCreateRenter);
  const primaryNavigation = [
    { href: withLocale("/", locale), label: copy.home },
    { href: withLocale("/agencies", locale), label: copy.agencies, emphasize: true },
    { href: withLocale("/camping", locale), label: locale === "ar" ? "أماكن التخييم" : "Camping" }
  ];
  const secondaryNavigation = [
    { href: withLocale("/travel-partners", locale), label: copy.travelPartners },
    { href: withLocale("/listings/new", locale), label: copy.sell },
    { href: withLocale("/rentals", locale), label: copy.rent }
  ];

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, searchParams]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/70 backdrop-blur-xl">
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
            {primaryNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${getNavLinkClass(pathname === item.href.split("?")[0], item.emphasize)} w-full xl:w-auto`}
              >
                {item.label}
              </Link>
            ))}
            <div className="rounded-[1.4rem] border border-ink/10 bg-sand/50 p-3 xl:rounded-none xl:border-0 xl:bg-transparent xl:p-0">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-ink/45 xl:hidden">
                {locale === "ar" ? "المزيد" : "Plus"}
              </p>
              <div className="flex flex-col gap-2 xl:flex-row xl:flex-wrap xl:items-center">
                {secondaryNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${getNavLinkClass(pathname === item.href.split("?")[0])} w-full xl:w-auto xl:border-none xl:bg-transparent xl:px-2 xl:py-2 xl:text-ink/70 xl:shadow-none`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
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
            </div>
            {session?.user ? (
              <>
                <Link href={withLocale("/messages", locale)} className={`${getNavLinkClass(pathname.startsWith("/messages"))} w-full xl:w-auto`}>
                  {copy.messages}
                </Link>
                {isAgency ? (
                  <Link
                    href={withLocale("/agency/dashboard", locale)}
                    className={`${getNavLinkClass(pathname.startsWith("/agency/dashboard"), true)} w-full xl:w-auto`}
                  >
                    {copy.agencyDashboard}
                  </Link>
                ) : isRenter ? (
                  <Link
                    href={withLocale("/renter/dashboard", locale)}
                    className={`${getNavLinkClass(pathname.startsWith("/renter/dashboard"), true)} w-full xl:w-auto`}
                  >
                    {locale === "ar" ? "لوحة الكراء" : "Tableau location"}
                  </Link>
                ) : (
                  <div className="flex flex-col gap-2 xl:flex-row xl:min-w-0">
                    <Link href={withLocale("/dashboard", locale)} className="w-full rounded-full border border-ink/10 bg-white/80 px-4 py-2 text-center shadow-card xl:w-auto">
                      {locale === "ar" ? "لوحتي" : "Mon tableau"}
                    </Link>
                    {canCreateAgency ? (
                      <Link href={withLocale("/agency/profile", locale)} className="w-full rounded-full bg-forest px-4 py-2 text-center text-white shadow-card xl:w-auto">
                        {copy.becomeAgency}
                      </Link>
                    ) : null}
                    {canCreateRenter ? (
                      <Link href={withLocale("/renter/profile", locale)} className="w-full rounded-full border border-ink/10 bg-white/80 px-4 py-2 text-center shadow-card xl:w-auto">
                        {locale === "ar" ? "أنشئ ملف كراء" : "Creer un profil location"}
                      </Link>
                    ) : null}
                  </div>
                )}
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
                <Link href={withLocale("/agencies", locale)} className="w-full rounded-full border border-forest/20 bg-sand/70 px-4 py-2 text-center font-semibold text-forest shadow-card xl:w-auto">
                  {copy.heroPrimaryCta}
                </Link>
                <Link href={withLocale("/register", locale)} className="w-full rounded-full bg-forest px-4 py-2 text-center text-white shadow-card xl:w-auto">
                  {copy.register}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
