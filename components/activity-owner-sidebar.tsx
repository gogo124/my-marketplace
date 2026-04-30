"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { resolveLocale, withLocale } from "@/lib/i18n";

export function ActivityOwnerSidebar({ hasAccess }: { hasAccess: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang") || undefined);
  const isArabic = locale === "ar";
  const items = hasAccess
    ? [
        { href: "/activity/dashboard", label: isArabic ? "اللوحة" : "Dashboard" },
        { href: "/activity/activities", label: isArabic ? "أنشطتي" : "My activities" },
        { href: "/activity/requests", label: isArabic ? "الطلبات" : "Requests" },
        { href: "/messages", label: isArabic ? "الرسائل" : "Messages" }
      ]
    : [{ href: "/activity/dashboard", label: isArabic ? "الوصول للأنشطة" : "Activity access" }];

  return (
    <aside className="sticky top-6 space-y-4">
      <section className="image-surface rounded-[2rem] p-6 text-white shadow-card">
        <p className="text-xs uppercase tracking-[0.25em] text-white/60">{isArabic ? "مزود الأنشطة" : "Activity provider"}</p>
        <h2 className="mt-3 text-2xl font-black">{isArabic ? "إدارة الأنشطة والحجوزات" : "Manage activities and requests"}</h2>
      </section>
      <nav className="rounded-[2rem] border border-slate-100 bg-white p-3 shadow-[0_12px_34px_rgba(15,61,46,0.08)]">
        <div className="space-y-1">
          {items.map((item) => {
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
