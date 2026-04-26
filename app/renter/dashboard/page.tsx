import { redirect } from "next/navigation";
import {
  DashboardEmptyState,
  DashboardHero,
  DashboardMetricGrid,
  DashboardQuickLinks,
  DashboardSection
} from "@/components/dashboard/dashboard-primitives";
import { AgencyStatusActions } from "@/components/agency-status-actions";
import { PartnershipManager } from "@/components/partnership-manager";
import { StatusBadge } from "@/components/status-badge";
import { getAuthSession } from "@/lib/auth";
import { resolveLocale, withLocale } from "@/lib/i18n";
import { getRenterWorkspaceRedirectPath, getSessionUser } from "@/lib/permissions";
import { getRenterDashboardData } from "@/lib/renter";

export default async function RenterDashboardPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect(withLocale("/login", locale));
  }

  const dashboard = await getRenterDashboardData(session.user.id);
  const redirectPath = getRenterWorkspaceRedirectPath(getSessionUser(session), locale, Boolean(dashboard.profile?._id));

  if (redirectPath) {
    redirect(redirectPath);
  }

  return (
    <div className="space-y-8">
      <DashboardHero
        kicker={locale === "ar" ? "لوحة الكراء" : "Rental workspace"}
        title={locale === "ar" ? "إدارة عناصر الكراء وطلبات الزبائن" : "Manage rental items and customer requests"}
        body={locale === "ar" ? "الوصول السريع إلى العناصر وطلبات الكراء والمراجعات والشراكات." : "Quick access to items, requests, reviews, and partnerships."}
        locale={locale}
        chips={[
          `${dashboard.stats.itemsCount} ${locale === "ar" ? "عنصر" : "items"}`,
          `${dashboard.stats.rentalRequestsCount} ${locale === "ar" ? "طلب" : "requests"}`,
          `${dashboard.stats.availableUnits} ${locale === "ar" ? "وحدة متاحة" : "available units"}`
        ]}
        actions={[
          { href: "/renter/items", label: locale === "ar" ? "عناصري" : "My items" },
          { href: "/messages", label: locale === "ar" ? "الرسائل" : "Messages" }
        ]}
      />

      <DashboardMetricGrid
        locale={locale}
        cards={[
          { href: "/renter/items", label: locale === "ar" ? "العناصر" : "Items", value: dashboard.stats.itemsCount, note: locale === "ar" ? "كل العناصر المنشورة" : "All published items", tone: "forest" },
          { href: "/renter/dashboard", label: locale === "ar" ? "النشطة" : "Active", value: dashboard.stats.activeItemsCount, note: locale === "ar" ? "جاهزة للحجز" : "Ready for requests", tone: "clay" },
          { href: "/renter/dashboard", label: locale === "ar" ? "الطلبات" : "Requests", value: dashboard.stats.rentalRequestsCount, note: locale === "ar" ? "طلبات الكراء الحالية" : "Current rental requests", tone: "amber" },
          { href: "/renter/dashboard", label: locale === "ar" ? "التقييمات" : "Reviews", value: dashboard.stats.reviewsCount, note: locale === "ar" ? "تقييمات حسابك" : "Account reviews", tone: "slate" }
        ]}
      />

      <DashboardQuickLinks
        locale={locale}
        items={[
          { href: "/renter/items", label: locale === "ar" ? "عناصري" : "My items", note: locale === "ar" ? "أدر معداتك" : "Manage your gear" },
          { href: "/renter/profile", label: locale === "ar" ? "الملف" : "Profile", note: locale === "ar" ? "معلومات المزود" : "Provider details" },
          { href: "/messages", label: locale === "ar" ? "الرسائل" : "Messages", note: locale === "ar" ? "رد على الزبائن" : "Reply to customers" }
        ]}
      />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <DashboardSection
          title={locale === "ar" ? "طلبات الكراء" : "Rental requests"}
          body={locale === "ar" ? "الكمية، المدة، الإجمالي، والحالة." : "Quantity, duration, total price, and status."}
        >
          <div className="flex items-center justify-between gap-3 rounded-[1.75rem] border border-slate-100 bg-slate-50/80 p-4">
            <div>
              <p className="text-sm text-slate-500">{locale === "ar" ? "المعدل" : "Average"}</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{(dashboard as any).reviewsSummary?.averageRating || 0}/5</p>
            </div>
            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0f3d2e] shadow-sm">
              {locale === "ar" ? "مؤشر الرضا" : "Satisfaction"}
            </span>
          </div>

          {dashboard.rentalRequests.length > 0 ? (
            <div className="mt-4 grid gap-4">
              {dashboard.rentalRequests.slice(0, 8).map((request: any) => (
                <article key={request._id} className="rounded-[1.75rem] border border-slate-100 p-4 transition hover:-translate-y-0.5 hover:bg-slate-50">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{request.trip?.title || (locale === "ar" ? "طلب كراء" : "Rental request")}</p>
                      <p className="mt-1 text-sm text-slate-500">{request.agency?.name || "-"} • {request.rentalItem?.title || "-"}</p>
                      <p className="mt-1 text-sm text-slate-500">{request.quantity || 1} • {request.durationDays || 1} • {request.totalPrice || 0} DH</p>
                    </div>
                    <StatusBadge kind="rental" status={request.status} locale={locale} />
                  </div>
                  <div className="mt-4">
                    <AgencyStatusActions
                      endpoint="/api/rental-requests"
                      idField="rentalRequestId"
                      itemId={request._id}
                      status={request.status || "pending"}
                      allowedStatuses={["pending", "approved", "delivered", "returned"]}
                    />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <DashboardEmptyState
              title={locale === "ar" ? "لا توجد طلبات كراء بعد" : "No rental requests yet"}
              body={locale === "ar" ? "عندما يطلب الزبائن معداتك ستظهر هنا." : "Customer requests will appear here once your gear gets traction."}
              href="/renter/items"
              ctaLabel={locale === "ar" ? "عناصري" : "My items"}
              locale={locale}
            />
          )}
        </DashboardSection>

        <DashboardSection title={locale === "ar" ? "المراجعات" : "Reviews"} body={locale === "ar" ? "التقييمات المرتبطة بالحساب." : "Reviews linked to your account."}>
          {(dashboard as any).reviews?.length > 0 ? (
            <div className="grid gap-4">
              {(dashboard as any).reviews.slice(0, 6).map((review: any) => (
                <article key={review._id} className="rounded-[1.75rem] border border-slate-100 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{review.listing?.title || review.place?.name || (locale === "ar" ? "مراجعة" : "Review")}</p>
                      <p className="mt-1 text-sm text-slate-500">{review.rating}/5</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500 line-clamp-3">{review.comment}</p>
                    </div>
                    <StatusBadge kind="review" status={review.status} locale={locale} />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <DashboardEmptyState
              title={locale === "ar" ? "لا توجد مراجعات بعد" : "No reviews yet"}
              body={locale === "ar" ? "ستظهر تقييمات العملاء هنا." : "Customer feedback will show up here."}
              href="/renter/items"
              ctaLabel={locale === "ar" ? "إدارة العناصر" : "Manage items"}
              locale={locale}
            />
          )}
        </DashboardSection>
      </section>

      <PartnershipManager
        role="renter"
        directory={(dashboard.partnerships as any).directory || []}
        accepted={(dashboard.partnerships as any).accepted || []}
        incomingRequests={(dashboard.partnerships as any).incomingRequests || []}
        outgoingRequests={(dashboard.partnerships as any).outgoingRequests || []}
        locale={locale}
      />
    </div>
  );
}
