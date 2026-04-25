import Link from "next/link";
import { redirect } from "next/navigation";
import { AgencyOverviewSection, AgencyReservationsSection, AgencyStatsGrid } from "@/components/agency-owner-sections";
import { StatusBadge } from "@/components/status-badge";
import { PartnershipManager } from "@/components/partnership-manager";
import { getAuthSession } from "@/lib/auth";
import { getAgencyDashboardData } from "@/lib/agency";
import { getDirection, resolveLocale, siteCopy, withLocale } from "@/lib/i18n";
import { getAgencyWorkspaceRedirectPath, getSessionUser } from "@/lib/permissions";

export default async function AgencyDashboardPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const copy = siteCopy[locale];
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect(withLocale("/login", locale));
  }

  const dashboard = await getAgencyDashboardData(session.user.id);
  const redirectPath = getAgencyWorkspaceRedirectPath(getSessionUser(session), locale, Boolean(dashboard.profile?._id));

  if (redirectPath) {
    redirect(redirectPath);
  }

  const cards = [
    { href: "/agency/trips", label: copy.trips, value: dashboard.stats.tripsCount, note: locale === "ar" ? "الرحلات ورموزها" : "Trips and codes" },
    { href: "/agency/reservations", label: copy.reservations, value: dashboard.stats.reservationsCount, note: locale === "ar" ? "إدارة الحجوزات" : "Manage reservations" },
    { href: "/agency/rental-requests", label: locale === "ar" ? "طلبات الكراء" : "Demandes location", value: dashboard.stats.rentalRequestsCount, note: locale === "ar" ? "مرتبطة برحلاتك" : "Linked to your trips" }
  ];

  return (
    <div dir={getDirection(locale)} className="space-y-8">
      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <h1 className="text-3xl font-black text-ink">{copy.agencyDashboardTitle}</h1>
        <p className="mt-3 text-sm text-ink/60">{copy.agencyDashboardBody}</p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={withLocale(card.href, locale)} className="rounded-[2rem] bg-white p-6 shadow-card">
            <p className="text-sm text-ink/50">{card.label}</p>
            <p className="mt-3 text-3xl font-black text-ink">{card.value || 0}</p>
            <p className="mt-2 text-sm text-ink/60">{card.note}</p>
          </Link>
        ))}
      </section>

      <AgencyStatsGrid stats={dashboard.stats as any} locale={locale} />
      <AgencyOverviewSection
        stats={dashboard.stats as any}
        leadsByType={(dashboard.stats as any).leadsByType || {}}
        locale={locale}
      />
      <AgencyReservationsSection reservations={dashboard.reservations as any[]} locale={locale} />

      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-ink">{locale === "ar" ? "المراجعات والتقييم" : "Avis et note"}</h2>
            <p className="mt-2 text-sm text-ink/60">
              {locale === "ar" ? "ملخص مراجعات هذا الحساب داخل المنصة." : "Resume des avis lies a ce compte dans la plateforme."}
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-sand px-5 py-4 text-right">
            <p className="text-sm text-ink/50">{locale === "ar" ? "المعدل" : "Moyenne"}</p>
            <p className="mt-2 text-3xl font-black text-clay">{(dashboard as any).reviewsSummary?.averageRating || 0}/5</p>
          </div>
        </div>
        {(dashboard as any).reviews?.length > 0 ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {(dashboard as any).reviews.slice(0, 6).map((review: any) => (
              <article key={review._id} className="rounded-[1.5rem] border border-ink/10 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{review.listing?.title || review.place?.name || (locale === "ar" ? "مراجعة" : "Avis")}</p>
                    <p className="mt-1 text-sm text-ink/60">{review.rating}/5</p>
                    <p className="mt-2 text-sm text-ink/70 line-clamp-3">{review.comment}</p>
                  </div>
                  <StatusBadge kind="review" status={review.status} locale={locale} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-ink/60">{locale === "ar" ? "لا توجد مراجعات بعد." : "Pas encore d'avis."}</p>
        )}
      </section>

      <PartnershipManager
        role="agency"
        directory={(dashboard.partnerships as any).directory || []}
        accepted={(dashboard.partnerships as any).accepted || []}
        incomingRequests={(dashboard.partnerships as any).incomingRequests || []}
        outgoingRequests={(dashboard.partnerships as any).outgoingRequests || []}
        locale={locale}
      />
    </div>
  );
}
