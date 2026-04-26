import Link from "next/link";
import {
  DashboardEmptyState,
  DashboardHero,
  DashboardMetricGrid,
  DashboardQuickLinks,
  DashboardSection
} from "@/components/dashboard/dashboard-primitives";
import { StatusBadge } from "@/components/status-badge";
import {
  getAdminAgencies,
  getAdminAnalyticsSummary,
  getAdminDashboardData,
  getAdminPageSession,
  getAdminRentalRequests,
  getAdminReports,
  getAdminReservations,
  getAdminReviews
} from "@/lib/admin";
import { formatLocaleDateTime, getDirection, resolveLocale, siteCopy, withLocale } from "@/lib/i18n";

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const copy = siteCopy[locale];
  await getAdminPageSession();

  let dashboard: Awaited<ReturnType<typeof getAdminDashboardData>> | null = null;
  let analytics: Awaited<ReturnType<typeof getAdminAnalyticsSummary>> | null = null;
  let dashboardError = "";
  let analyticsError = "";

  try {
    const [dashboardData, pendingReports, pendingReviews, pendingReservations, pendingRentalRequests, agencies] = await Promise.all([
      getAdminDashboardData(),
      getAdminReports("pending"),
      getAdminReviews("pending"),
      getAdminReservations("pending"),
      getAdminRentalRequests("pending"),
      getAdminAgencies()
    ]);

    const pendingAgencies = agencies.filter((agency: any) => agency.verificationStatus !== "verified");
    dashboard = dashboardData as Awaited<ReturnType<typeof getAdminDashboardData>>;

    try {
      analytics = await getAdminAnalyticsSummary();
    } catch (error) {
      analyticsError = error instanceof Error ? error.message : "Could not load analytics.";
      console.error("Failed to load admin analytics", error);
    }

    const queueItems = [
      ...pendingReports.slice(0, 3).map((report: any) => ({
        key: `report-${report._id}`,
        title: report.target?.name || report.reason || (locale === "ar" ? "بلاغ" : "Report"),
        subtitle: `${report.targetType} • ${report.status || "pending"}`,
        href: "/admin/reports",
        badge: { kind: "report" as const, status: report.status }
      })),
      ...pendingReviews.slice(0, 2).map((review: any) => ({
        key: `review-${review._id}`,
        title: review.listing?.title || review.place?.name || (locale === "ar" ? "مراجعة" : "Review"),
        subtitle: `${review.rating || 0}/5 • ${review.status || "pending"}`,
        href: "/admin/reviews",
        badge: { kind: "review" as const, status: review.status }
      })),
      ...pendingReservations.slice(0, 2).map((reservation: any) => ({
        key: `reservation-${reservation._id}`,
        title: reservation.trip?.title || (locale === "ar" ? "حجز" : "Reservation"),
        subtitle: `${reservation.agency?.name || "-"} • ${reservation.seats || 0} seats`,
        href: "/admin/reservations",
        badge: { kind: "reservation" as const, status: reservation.status }
      })),
      ...pendingRentalRequests.slice(0, 2).map((request: any) => ({
        key: `rental-${request._id}`,
        title: request.trip?.title || (locale === "ar" ? "طلب كراء" : "Rental request"),
        subtitle: `${request.rentalItem?.title || "-"} • ${request.status || "pending"}`,
        href: "/admin/rental-requests",
        badge: { kind: "rental" as const, status: request.status }
      })),
      ...pendingAgencies.slice(0, 2).map((agency: any) => ({
        key: `agency-${agency._id}`,
        title: agency.name || (locale === "ar" ? "وكالة" : "Agency"),
        subtitle: `${agency.city || "-"} • ${agency.verificationStatus || "pending"}`,
        href: "/admin/agencies",
        badge: { kind: "account" as const, status: agency.verificationStatus === "verified" ? "verified" : "pending" }
      }))
    ].slice(0, 8);

    const metricCards = [
      { label: copy.users, value: dashboardData.stats.usersCount, note: locale === "ar" ? "الحسابات المسجلة" : "Registered accounts", href: "/admin/users", tone: "forest" as const },
      { label: copy.listings, value: dashboardData.stats.listingsCount, note: locale === "ar" ? "إعلانات السوق" : "Marketplace listings", href: "/admin/listings", tone: "clay" as const },
      { label: locale === "ar" ? "المعدات" : "Rentals", value: dashboardData.stats.rentalItemsCount, note: locale === "ar" ? "عناصر الكراء" : "Rental items", href: "/admin/rental-requests", tone: "amber" as const },
      { label: copy.agencies, value: dashboardData.stats.agenciesCount, note: locale === "ar" ? "الوكالات المسجلة" : "Registered agencies", href: "/admin/agencies", tone: "slate" as const },
      { label: copy.reservations, value: dashboardData.stats.reservationsCount, note: locale === "ar" ? "حجوزات الرحلات" : "Trip reservations", href: "/admin/reservations", tone: "forest" as const },
      { label: locale === "ar" ? "طلبات المراجعة" : "Pending approvals", value: dashboardData.stats.pendingApprovalsCount, note: locale === "ar" ? "في انتظار المراجعة" : "Waiting for moderation", href: "/admin/reports", tone: "clay" as const },
      { label: copy.reports, value: dashboardData.stats.reportsCount, note: locale === "ar" ? "بلاغات المستخدمين" : "User reports", href: "/admin/reports", tone: "amber" as const },
      { label: copy.messages, value: dashboardData.stats.messagesCount, note: locale === "ar" ? "آخر المحادثات" : "Latest chats", href: "/admin/messages", tone: "slate" as const }
    ];

    return (
      <div dir={getDirection(locale)} className="space-y-8">
        <DashboardHero
          kicker={copy.overview}
          title={copy.adminPlatformControl}
          body={copy.adminPlatformBody}
          locale={locale}
          chips={[
            `${dashboardData.stats.pendingApprovalsCount} ${locale === "ar" ? "قيد المراجعة" : "pending"}`,
            `${dashboardData.stats.verifiedAgenciesCount} ${locale === "ar" ? "وكالة موثقة" : "verified agencies"}`,
            `${dashboardData.stats.verifiedSellersCount} ${locale === "ar" ? "بائع موثق" : "verified sellers"}`
          ]}
          actions={[
            { href: "/admin/users", label: copy.users },
            { href: "/admin/reports", label: copy.reports }
          ]}
        />

        <DashboardMetricGrid cards={metricCards} locale={locale} />

        <DashboardQuickLinks
          locale={locale}
          items={[
            { href: "/admin/users", label: copy.users, note: locale === "ar" ? "إدارة الحسابات" : "Manage accounts" },
            { href: "/admin/listings", label: copy.listings, note: locale === "ar" ? "إعلانات السوق" : "Marketplace listings" },
            { href: "/admin/rental-requests", label: locale === "ar" ? "طلبات الكراء" : "Rental requests", note: locale === "ar" ? "تتبع الطلبات" : "Track requests" },
            { href: "/admin/agencies", label: copy.agencies, note: locale === "ar" ? "مراجعة الوكالات" : "Review agencies" },
            { href: "/admin/reservations", label: copy.reservations, note: locale === "ar" ? "الحجوزات" : "Reservations" },
            { href: "/admin/reviews", label: copy.reviews, note: locale === "ar" ? "المراجعات" : "Reviews" },
            { href: "/admin/messages", label: copy.messages, note: locale === "ar" ? "الرسائل" : "Messages" },
            { href: "/admin/reports", label: copy.reports, note: locale === "ar" ? "التبليغات" : "Reports" },
            { href: "/admin", label: locale === "ar" ? "الإعدادات" : "Settings", note: locale === "ar" ? "إعدادات المنصة" : "Platform settings" }
          ]}
        />

        <DashboardSection
          title={locale === "ar" ? "التحليلات" : "Analytics"}
          body={locale === "ar" ? "نظرة سريعة على نشاط المنصة الفعلي." : "A quick look at real platform activity."}
        >
          {analytics ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  { label: locale === "ar" ? "مشاهدات الصفحات" : "Page views", value: analytics.pageViews, tone: "forest" as const },
                  { label: locale === "ar" ? "نقرات الحجز" : "Booking clicks", value: analytics.bookingClicks, tone: "clay" as const },
                  { label: locale === "ar" ? "نقرات واتساب" : "WhatsApp clicks", value: analytics.whatsappClicks, tone: "amber" as const },
                  { label: locale === "ar" ? "نقرات الإعلانات" : "Listing clicks", value: analytics.listingClicks, tone: "slate" as const },
                  { label: locale === "ar" ? "محاولات الحجز" : "Reservation attempts", value: analytics.reservationAttempts, tone: "forest" as const },
                  { label: locale === "ar" ? "نسبة الإتمام" : "Completion rate", value: `${analytics.conversionRate}%`, tone: "clay" as const }
                ].map((metric) => (
                  <div key={metric.label} className="rounded-[1.75rem] border border-slate-100 p-4 shadow-[0_10px_28px_rgba(15,61,46,0.06)]">
                    <p className="text-sm text-slate-500">{metric.label}</p>
                    <p className={`mt-3 text-3xl font-black ${metric.tone === "clay" ? "text-[#f97316]" : metric.tone === "forest" ? "text-[#0f3d2e]" : "text-slate-900"}`}>
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
                <div className="rounded-[1.75rem] border border-slate-100 p-4">
                  <h3 className="text-lg font-bold text-slate-900">{locale === "ar" ? "آخر الأحداث" : "Recent events"}</h3>
                  <div className="mt-4 space-y-3">
                    {analytics.recentEvents.length > 0 ? (
                      analytics.recentEvents.map((event) => (
                        <div key={`${event.type}-${event.timestamp}-${event.page}`} className="rounded-[1.25rem] bg-slate-50/80 p-3">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f97316]">{event.type}</p>
                              <p className="mt-1 text-sm font-semibold text-slate-900">{event.page}</p>
                            </div>
                            <p className="text-xs text-slate-400">{formatLocaleDateTime(event.timestamp, locale)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">{locale === "ar" ? "لا توجد أحداث بعد." : "No events yet."}</p>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-100 p-4">
                  <h3 className="text-lg font-bold text-slate-900">{locale === "ar" ? "الصفحات الأكثر نشاطاً" : "Top pages"}</h3>
                  <div className="mt-4 space-y-3">
                    {analytics.topPages.length > 0 ? (
                      analytics.topPages.map((page) => (
                        <div key={page.page} className="rounded-[1.25rem] bg-slate-50/80 p-3">
                          <p className="truncate text-sm font-semibold text-slate-900">{page.page}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                            {page.count} {locale === "ar" ? "حدث" : "events"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">{locale === "ar" ? "لا توجد صفحات بعد." : "No page activity yet."}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <DashboardEmptyState
              title={locale === "ar" ? "تعذر تحميل التحليلات" : "Could not load analytics"}
              body={analyticsError || (locale === "ar" ? "حدث خطأ غير متوقع." : "An unexpected error occurred.")}
              href="/admin"
              ctaLabel={locale === "ar" ? "إعادة المحاولة" : "Retry"}
              secondaryHref="/admin/reports"
              secondaryLabel={copy.reports}
              locale={locale}
            />
          )}
        </DashboardSection>

        <DashboardSection
          title={locale === "ar" ? "قائمة المراجعة السريعة" : "Pending moderation queue"}
          body={locale === "ar" ? "أهم العناصر التي تحتاج مراجعة الآن." : "The most important items requiring attention right now."}
        >
          {queueItems.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {queueItems.map((item) => (
                <div key={item.key} className="rounded-[1.75rem] border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        {locale === "ar" ? "عناصر عاجلة" : "Priority"}
                      </p>
                      <h3 className="mt-2 truncate text-lg font-bold text-slate-900">{item.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{item.subtitle}</p>
                    </div>
                    <StatusBadge kind={item.badge.kind} status={item.badge.status} locale={locale} />
                  </div>
                  <div className="mt-4">
                    <Link
                      href={withLocale(item.href, locale)}
                      className="inline-flex rounded-full bg-[#0f3d2e] px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5"
                    >
                      {locale === "ar" ? "فتح" : "Open"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <DashboardEmptyState
              title={locale === "ar" ? "لا توجد عناصر معلقة" : "Nothing pending"}
              body={locale === "ar" ? "لوحة المراجعة نظيفة حالياً." : "The moderation queue is clear right now."}
              href="/admin/reports"
              ctaLabel={copy.reports}
              secondaryHref="/admin/users"
              secondaryLabel={copy.users}
              locale={locale}
            />
          )}
        </DashboardSection>

        <DashboardSection
          title={locale === "ar" ? "النشاط الأخير" : "Recent activity"}
          body={locale === "ar" ? "آخر النشاطات عبر المستخدمين والوكالات والمحتوى." : "Latest activity across users, agencies, and content."}
        >
          <div className="grid gap-4">
            {dashboardData.recentActivity.length > 0 ? (
              dashboardData.recentActivity.map((activity) => (
                <Link
                  key={`${activity.type}-${activity.id}`}
                  href={withLocale(activity.href, locale)}
                  className="rounded-[1.5rem] border border-slate-100 p-4 transition hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">{activity.type}</p>
                      <p className="mt-2 text-lg font-bold text-slate-900">{activity.title}</p>
                      <p className="mt-2 text-sm text-slate-500">{activity.subtitle}</p>
                    </div>
                    <p className="text-sm text-slate-400">{formatLocaleDateTime(activity.createdAt, locale)}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-500">{locale === "ar" ? "لا يوجد نشاط حديث." : "No recent activity."}</p>
            )}
          </div>
        </DashboardSection>
      </div>
    );
  } catch (error) {
    dashboardError = error instanceof Error ? error.message : "Could not load admin dashboard.";
  }

  if (!dashboard) {
    return (
      <div dir={getDirection(locale)} className="space-y-8">
        <DashboardHero
          kicker={copy.overview}
          title={copy.adminPlatformControl}
          body={copy.adminPlatformBody}
          locale={locale}
        />
        <DashboardEmptyState
          title={locale === "ar" ? "تعذر تحميل لوحة التحكم" : "Could not load the dashboard"}
          body={dashboardError || (locale === "ar" ? "حدث خطأ غير متوقع." : "An unexpected error occurred.")}
          href="/admin"
          ctaLabel={locale === "ar" ? "إعادة المحاولة" : "Retry"}
          secondaryHref="/admin/reports"
          secondaryLabel={copy.reports}
          locale={locale}
        />
      </div>
    );
  }

  return null;
}
