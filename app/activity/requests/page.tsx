import { DashboardSection } from "@/components/dashboard/dashboard-primitives";
import { WorkspaceAccessState } from "@/components/workspace-access-state";
import { AgencyStatusActions } from "@/components/agency-status-actions";
import { getAuthSession } from "@/lib/auth";
import { getActivityDashboardData } from "@/lib/activity";
import { resolveLocale } from "@/lib/i18n";

export default async function ActivityRequestsPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const isArabic = locale === "ar";
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return (
      <WorkspaceAccessState
        locale={locale}
        title={isArabic ? "خاصك تسجل الدخول" : "Connexion requise"}
        body={isArabic ? "سجل الدخول باش تشوف طلبات الأنشطة." : "Connectez-vous pour voir les demandes d'activite."}
        primaryHref="/login"
        primaryLabel={isArabic ? "تسجيل الدخول" : "Se connecter"}
        secondaryHref="/activities"
        secondaryLabel={isArabic ? "الأنشطة" : "Activities"}
      />
    );
  }

  const dashboard = await getActivityDashboardData(session.user.id);

  if (!dashboard.providerAccess.isActive) {
    return (
      <WorkspaceAccessState
        locale={locale}
        title={isArabic ? "الوصول غير مفعل" : "Access is not active"}
        body={isArabic ? "إدارة الطلبات متاحة فقط بعد التفعيل." : "Request management is only available after activation."}
        primaryHref="/activity/dashboard"
        primaryLabel={isArabic ? "لوحة الأنشطة" : "Activity dashboard"}
        secondaryHref="/activities"
        secondaryLabel={isArabic ? "الأنشطة" : "Activities"}
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="image-surface rounded-[2.75rem] px-8 py-10 text-white shadow-card">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">{isArabic ? "الطلبات" : "Requests"}</p>
        <h1 className="mt-4 text-4xl font-black">{isArabic ? "طلبات الحجز والتواصل" : "Reservation and contact requests"}</h1>
      </section>

      <DashboardSection title={isArabic ? "كل الطلبات" : "All requests"} body={isArabic ? "طلبات العملاء الخاصة بالأنشطة فقط." : "Customer requests tied only to your activities."}>
        {dashboard.requests.length > 0 ? (
          <div className="grid gap-4">
            {dashboard.requests.map((request: any) => (
              <article key={request._id} className="rounded-[1.75rem] border border-slate-100 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{request.activityId?.title || (isArabic ? "طلب نشاط" : "Activity request")}</p>
                    <p className="mt-1 text-sm text-slate-500">{request.name} • {request.phone}</p>
                    <p className="mt-1 text-sm text-slate-500">{request.city || "-"} • {request.quantity || 1}</p>
                    <p className="mt-2 text-sm text-slate-600">{request.message}</p>
                  </div>
                  <AgencyStatusActions endpoint="/api/leads" idField="leadId" itemId={request._id} status={request.status || "new"} allowedStatuses={["new", "contacted", "closed"]} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">{isArabic ? "لا توجد طلبات بعد." : "No requests yet."}</p>
        )}
      </DashboardSection>
    </div>
  );
}
