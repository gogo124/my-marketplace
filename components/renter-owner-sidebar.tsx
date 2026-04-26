"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { resolveLocale, withLocale } from "@/lib/i18n";

export function RenterOwnerSidebar({ isRenter, canCreateRenter = false }: { isRenter: boolean; canCreateRenter?: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const labels =
    locale === "ar"
      ? {
          owner: "مساحة المزود",
          title: "إدارة الكراء",
          body: "ملف مستقل لمزود الكراء مع عناصر ولوحة خاصة به.",
          profile: "ملف المزود",
          dashboard: "لوحة الكراء",
          items: "عناصر الكراء",
          become: "أنشئ ملف مزود كراء"
        }
      : {
          owner: "Renter space",
          title: "Gestion location",
          body: "Espace separe pour les partenaires location avec profil, tableau de bord et articles.",
          profile: "Profil location",
          dashboard: "Tableau location",
          items: "Articles location",
          become: "Creer un profil location"
        };

  const navigation = [
    { href: "/renter/dashboard", label: labels.dashboard },
    { href: "/renter/profile", label: labels.profile },
    { href: "/renter/items", label: labels.items }
  ];
  const visibleNavigation = isRenter
    ? navigation
    : canCreateRenter
      ? [{ href: "/renter/profile", label: labels.become }]
      : [];

  return (
    <aside className="sticky top-6 space-y-6">
      <section className="image-surface rounded-[2rem] p-6 text-white shadow-card">
        <p className="text-xs uppercase tracking-[0.25em] text-white/60">{labels.owner}</p>
        <h2 className="mt-3 text-2xl font-black">{labels.title}</h2>
        <p className="mt-3 text-sm leading-7 text-white/75">{labels.body}</p>
      </section>

      <nav className="rounded-[2rem] border border-slate-100 bg-white p-3 shadow-[0_12px_34px_rgba(15,61,46,0.08)]">
        <div className="space-y-1">
          {visibleNavigation.map((item) => (
            <Link
              key={item.href}
              href={withLocale(item.href, locale)}
              className={`block rounded-[1.25rem] px-4 py-3 text-sm font-semibold transition ${
                pathname === item.href ? "bg-[#0f3d2e] text-white shadow-card" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}
