import Link from "next/link";
import { getAdminDashboardData } from "@/lib/admin";
import { formatLocaleDateTime, getDirection, resolveLocale, siteCopy, withLocale } from "@/lib/i18n";

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const copy = siteCopy[locale];
  const statCards = [
    { key: "usersCount", label: copy.users },
    { key: "agenciesCount", label: copy.agencies },
    { key: "listingsCount", label: copy.listings },
    { key: "travelPostsCount", label: copy.travelPartners },
    { key: "reservationsCount", label: copy.reservations },
    { key: "leadsCount", label: copy.leads },
    { key: "reviewsCount", label: copy.reviews },
    { key: "messagesCount", label: copy.messages },
    { key: "reportsCount", label: copy.reports }
  ] as const;
  const dashboard = await getAdminDashboardData();

  return (
    <div dir={getDirection(locale)} className="space-y-8">
      <section className="rounded-[2.75rem] bg-forest px-8 py-10 text-white shadow-card">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">{copy.overview}</p>
        <h1 className="mt-4 text-4xl font-black">{copy.adminPlatformControl}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">
          {copy.adminPlatformBody}
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.key} className="rounded-[2rem] bg-white p-6 shadow-card">
            <p className="text-sm text-ink/50">{card.label}</p>
            <p className="mt-3 text-3xl font-black text-ink">{dashboard.stats[card.key]}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <p className="text-sm text-ink/50">{locale === "ar" ? "الوكالات الموثقة" : "Agences verifiees"}</p>
          <p className="mt-3 text-3xl font-black text-ink">{dashboard.stats.verifiedAgenciesCount}</p>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <p className="text-sm text-ink/50">{locale === "ar" ? "البائعون الموثقون" : "Vendeurs verifies"}</p>
          <p className="mt-3 text-3xl font-black text-ink">{dashboard.stats.verifiedSellersCount}</p>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <p className="text-sm text-ink/50">{locale === "ar" ? "الإعلانات النشطة" : "Annonces actives"}</p>
          <p className="mt-3 text-3xl font-black text-ink">{dashboard.stats.activeListingsCount}</p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        {[
          { href: "/admin/reservations", label: "Reservations" },
          { href: "/admin/rental-requests", label: "Rental requests" },
          { href: "/admin/reviews", label: "Reviews" },
          { href: "/admin/reports", label: "Reports" },
          { href: "/admin/users", label: "Users" }
        ].map((item) => (
          <Link key={item.href} href={withLocale(item.href, locale)} className="rounded-[2rem] bg-white p-5 shadow-card transition hover:bg-sand/40">
            <p className="text-lg font-bold text-ink">{item.label}</p>
            <p className="mt-2 text-sm text-ink/60">{locale === "ar" ? "فتح الإدارة" : "Ouvrir la gestion"}</p>
          </Link>
        ))}
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-ink">{locale === "ar" ? "النشاط الأخير" : "Activite recente"}</h2>
            <p className="mt-2 text-sm text-ink/60">{locale === "ar" ? "آخر النشاطات عبر المستخدمين والوكالات والمحتوى." : "Derniere activite sur les utilisateurs, agences et contenus."}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4">
          {dashboard.recentActivity.length > 0 ? (
            dashboard.recentActivity.map((activity) => (
              <Link
                key={`${activity.type}-${activity.id}`}
                href={withLocale(activity.href, locale)}
                className="rounded-[1.5rem] border border-ink/10 p-4 transition hover:bg-sand/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">{activity.type}</p>
                    <p className="mt-2 text-lg font-bold text-ink">{activity.title}</p>
                    <p className="mt-2 text-sm text-ink/60">{activity.subtitle}</p>
                  </div>
                  <p className="text-sm text-ink/50">{formatLocaleDateTime(activity.createdAt, locale)}</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-ink/60">{locale === "ar" ? "لا يوجد نشاط حديث." : "Aucune activite recente."}</p>
          )}
        </div>
      </section>
    </div>
  );
}
