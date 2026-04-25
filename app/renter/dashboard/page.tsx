import Link from "next/link";
import { redirect } from "next/navigation";
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

  const labels =
    locale === "ar"
      ? {
          title: "لوحة الكراء",
          body: "الوصول السريع إلى العناصر وطلبات الكراء والمراجعات والشراكات.",
          items: "العناصر",
          rentalRequests: "طلبات الكراء",
          reviews: "المراجعات"
        }
      : {
          title: "Tableau location",
          body: "Acces rapide aux articles, demandes location, avis et partenariats.",
          items: "Articles",
          rentalRequests: "Demandes location",
          reviews: "Avis"
        };

  const cards = [
    { href: "/renter/items", label: labels.items, value: dashboard.stats.itemsCount, note: locale === "ar" ? "إدارة العناصر" : "Manage items" },
    { href: "/renter/dashboard", label: labels.rentalRequests, value: dashboard.stats.rentalRequestsCount, note: locale === "ar" ? "طلباتك الحالية" : "Your current requests" },
    { href: "/renter/dashboard", label: labels.reviews, value: (dashboard.stats as any).reviewsCount || 0, note: locale === "ar" ? "مراجعات مرتبطة بالحساب" : "Account review history" }
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <h1 className="text-3xl font-black text-ink">{labels.title}</h1>
        <p className="mt-3 text-sm text-ink/60">{labels.body}</p>
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

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] bg-white p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-ink">{labels.rentalRequests}</h2>
              <p className="mt-2 text-sm text-ink/60">{locale === "ar" ? "الكمية، المدة، الإجمالي، والحالة." : "Quantite, duree, total et statut."}</p>
            </div>
            <div className="rounded-[1.5rem] bg-sand px-5 py-4 text-right">
              <p className="text-sm text-ink/50">{locale === "ar" ? "المعدل" : "Moyenne"}</p>
              <p className="mt-2 text-3xl font-black text-clay">{(dashboard as any).reviewsSummary?.averageRating || 0}/5</p>
            </div>
          </div>
          {dashboard.rentalRequests.length > 0 ? (
            <div className="mt-6 grid gap-4">
              {dashboard.rentalRequests.slice(0, 8).map((request: any) => (
                <article key={request._id} className="rounded-[1.5rem] border border-ink/10 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{request.trip?.title || labels.rentalRequests}</p>
                      <p className="mt-1 text-sm text-ink/60">{request.agency?.name || "-"} • {request.rentalItem?.title || "-"}</p>
                      <p className="mt-1 text-sm text-ink/60">{request.quantity || 1} • {request.durationDays || 1} • {request.totalPrice || 0} DH</p>
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
            <p className="mt-6 text-sm text-ink/60">{locale === "ar" ? "لا توجد طلبات كراء بعد." : "Pas encore de demandes location."}</p>
          )}
        </section>

        <section className="rounded-[2rem] bg-white p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-ink">{labels.reviews}</h2>
            <span className="text-sm text-ink/50">{(dashboard as any).reviews?.length || 0}</span>
          </div>
          {(dashboard as any).reviews?.length > 0 ? (
            <div className="mt-6 grid gap-4">
              {(dashboard as any).reviews.slice(0, 6).map((review: any) => (
                <article key={review._id} className="rounded-[1.5rem] border border-ink/10 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{review.listing?.title || review.place?.name || labels.reviews}</p>
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
