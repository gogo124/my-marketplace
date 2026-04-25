"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { resolveLocale, siteCopy, withLocale } from "@/lib/i18n";

type AgencyOwnerSidebarProps = {
  isAgency: boolean;
  canCreateAgency?: boolean;
  publicProfileId?: string;
};

export function AgencyOwnerSidebar({ isAgency, canCreateAgency = false, publicProfileId }: AgencyOwnerSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const copy = siteCopy[locale];
  const navigation = [
    { href: "/agency/dashboard", label: copy.overview },
    { href: "/agency/profile", label: copy.agencyProfile },
    { href: "/agency/trips", label: copy.trips },
    { href: "/agency/reservations", label: copy.reservations },
    { href: "/agency/rental-requests", label: locale === "ar" ? "طلبات الكراء" : "Demandes location" },
    { href: "/agency/leads", label: copy.leads }
  ];
  const visibleNavigation = isAgency
    ? navigation
    : canCreateAgency
      ? [{ href: "/agency/profile", label: copy.becomeAnAgency }]
      : [];

  return (
    <aside className="space-y-6">
      <section className="rounded-[2rem] bg-forest p-6 text-white shadow-card">
        <p className="text-xs uppercase tracking-[0.25em] text-white/60">{copy.agencyOwner}</p>
        <h2 className="mt-3 text-2xl font-black">{copy.privateNavigation}</h2>
        <p className="mt-3 text-sm leading-7 text-white/75">
          {copy.agencyOwnerBody}
        </p>
      </section>

      <nav className="rounded-[2rem] bg-white p-4 shadow-card">
        <div className="space-y-2">
          {visibleNavigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={withLocale(item.href, locale)}
                className={`block rounded-[1.25rem] px-4 py-3 font-semibold ${
                  isActive ? "bg-clay text-white" : "text-ink hover:bg-sand"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        {isAgency && publicProfileId ? (
          <div className="mt-4 border-t border-ink/10 pt-4">
            <Link
              href={withLocale(`/agencies/${publicProfileId}`, locale)}
              className="block rounded-[1.25rem] border border-ink/10 px-4 py-3 text-center font-semibold text-ink"
            >
              {copy.viewPublicProfile}
            </Link>
          </div>
        ) : null}
      </nav>
    </aside>
  );
}
