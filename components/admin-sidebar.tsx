"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { resolveLocale, siteCopy, withLocale } from "@/lib/i18n";

export function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const copy = siteCopy[locale];
  const navigation = [
    { href: "/admin", label: copy.overview },
    { href: "/admin/users", label: copy.users },
    { href: "/admin/agencies", label: copy.agencies },
    { href: "/admin/trips", label: copy.trips },
    { href: "/admin/places", label: locale === "ar" ? "أماكن التخييم" : "Lieux camping" },
    { href: "/admin/listings", label: copy.listings },
    { href: "/admin/travel-posts", label: copy.travelPartners },
    { href: "/admin/reservations", label: copy.reservations },
    { href: "/admin/rental-requests", label: locale === "ar" ? "طلبات الكراء" : "Demandes location" },
    { href: "/admin/partnerships", label: locale === "ar" ? "الشراكات" : "Partenariats" },
    { href: "/admin/leads", label: copy.leads },
    { href: "/admin/reports", label: copy.reports },
    { href: "/admin/reviews", label: copy.reviews },
    { href: "/admin/place-reviews", label: locale === "ar" ? "مراجعات الأماكن" : "Avis lieux" },
    { href: "/admin/stories", label: locale === "ar" ? "قصص الرحلات" : "Recits voyage" },
    { href: "/admin/messages", label: copy.messages }
  ];

  return (
    <aside className="sticky top-6 space-y-6">
      <section className="image-surface rounded-[2rem] p-6 text-white shadow-card">
        <p className="text-xs uppercase tracking-[0.25em] text-white/60">Admin</p>
        <h2 className="mt-3 text-2xl font-black">{copy.adminPlatformControl}</h2>
        <p className="mt-3 text-sm leading-7 text-white/75">
          {copy.adminPlatformBody}
        </p>
      </section>

      <nav className="rounded-[2rem] border border-slate-100 bg-white p-3 shadow-[0_12px_34px_rgba(15,61,46,0.08)]">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={withLocale(item.href, locale)}
                className={`block rounded-[1.25rem] px-4 py-3 text-sm font-semibold transition ${
                  isActive ? "bg-[#0f3d2e] text-white shadow-card" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
