import {
  DashboardHero,
  DashboardMetricGrid,
  DashboardQuickLinks,
  DashboardSection
} from "@/components/dashboard/dashboard-primitives";
import { ActivityProviderRequestForm } from "@/components/activity-provider-request-form";
import { getAuthSession } from "@/lib/auth";
import { getActivityDashboardData } from "@/lib/activity";
import { getDirection, resolveLocale } from "@/lib/i18n";
import { WorkspaceAccessState } from "@/components/workspace-access-state";

export default async function ActivityDashboardPage({
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
        body={isArabic ? "سجل الدخول باش تدخل للوحة الأنشطة." : "Connectez-vous pour access au tableau activites."}
        primaryHref="/login"
        primaryLabel={isArabic ? "تسجيل الدخول" : "Se connecter"}
        secondaryHref="/activities"
        secondaryLabel={isArabic ? "الأنشطة" : "Activities"}
      />
    );
  }

  const dashboard = await getActivityDashboardData(session.user.id);
  const access = dashboard.providerAccess;

  if (access.status === "none") {
    return (
      <div dir={getDirection(locale)} className="space-y-8">
        <DashboardHero
          kicker={isArabic ? "مساحة الأنشطة" : "Activity workspace"}
          title={isArabic ? "تفعيل مزود الأنشطة مطلوب" : "Activity provider access required"}
          body={isArabic ? "أرسل طلبك باش تولي تنشر الأنشطة وتستقبل الطلبات." : "Submit your request to publish activities and receive requests."}
          locale={locale}
          actions={[{ href: "/activities", label: isArabic ? "تصفح الأنشطة" : "Browse activities" }]}
        />
        <ActivityProviderRequestForm />
      </div>
    );
  }

  if (access.isPending || access.isRejected || access.isSuspended) {
    const title = access.isPending
      ? isArabic ? "طلبك قيد المراجعة" : "Your request is pending"
      : access.isRejected
        ? isArabic ? "تم رفض الطلب" : "The request was rejected"
        : isArabic ? "تم تعليق الوصول" : "Access is suspended";
    const body = access.isPending
      ? isArabic ? "الإدارة مازال كتراجع الطلب." : "The admin is still reviewing the request."
      : access.isRejected
        ? isArabic ? "تواصل مع الإدارة إذا بغيتي تعاود الطلب أو توضّح المعطيات." : "Contact the admin if you need to resubmit or clarify the request."
        : isArabic ? "تم قفل إدارة الأنشطة مؤقتاً." : "Activity management is temporarily locked.";

    return (
      <div dir={getDirection(locale)} className="space-y-8">
        <DashboardHero kicker={isArabic ? "مساحة الأنشطة" : "Activity workspace"} title={title} body={body} locale={locale} actions={[{ href: "/dashboard", label: isArabic ? "لوحتي" : "My dashboard" }]} />
      </div>
    );
  }

  return (
    <div dir={getDirection(locale)} className="space-y-8">
      <DashboardHero
        kicker={isArabic ? "مساحة الأنشطة" : "Activity workspace"}
        title={isArabic ? "لوحة مزود الأنشطة" : "Activity provider dashboard"}
        body={isArabic ? "أدر الأنشطة، الطلبات، والصور من مساحة منظمة وواضحة." : "Manage activities, requests, and photos from a clear workspace."}
        locale={locale}
        chips={[
          `${dashboard.stats.activitiesCount} ${isArabic ? "نشاط" : "activities"}`,
          `${dashboard.stats.requestsCount} ${isArabic ? "طلبات" : "requests"}`
        ]}
        actions={[
          { href: "/activity/activities", label: isArabic ? "أنشطتي" : "My activities" },
          { href: "/activity/requests", label: isArabic ? "الطلبات" : "Requests" }
        ]}
      />
      <DashboardMetricGrid
        locale={locale}
        cards={[
          { href: "/activity/activities", label: isArabic ? "كل الأنشطة" : "All activities", value: dashboard.stats.activitiesCount, tone: "forest" },
          { href: "/activity/activities", label: isArabic ? "النشطة" : "Active", value: dashboard.stats.activeActivitiesCount, tone: "clay" },
          { href: "/activity/requests", label: isArabic ? "الطلبات الجديدة" : "New requests", value: dashboard.stats.newRequestsCount, tone: "amber" },
          { href: "/activity/requests", label: isArabic ? "تم التواصل" : "Contacted", value: dashboard.stats.contactedRequestsCount, tone: "slate" }
        ]}
      />
      <DashboardQuickLinks
        locale={locale}
        items={[
          { href: "/activity/activities", label: isArabic ? "إدارة الأنشطة" : "Manage activities", note: isArabic ? "أنشئ وعدّل الأنشطة" : "Create and edit activities" },
          { href: "/activity/requests", label: isArabic ? "إدارة الطلبات" : "Manage requests", note: isArabic ? "راجع الطلبات والحجوزات" : "Review requests and reservations" },
          { href: "/activities", label: isArabic ? "الصفحة العمومية" : "Public activities", note: isArabic ? "راجع العرض العمومي" : "Review public discovery" }
        ]}
      />
      <DashboardSection title={isArabic ? "آخر الطلبات" : "Recent requests"} body={isArabic ? "طلبات التواصل والحجز الأخيرة." : "Latest reservation and contact requests."}>
        {dashboard.requests.length > 0 ? (
          <div className="grid gap-4">
            {dashboard.requests.slice(0, 6).map((request: any) => (
              <article key={request._id} className="rounded-[1.5rem] border border-slate-100 p-4">
                <p className="font-semibold text-slate-900">{request.activityId?.title || (isArabic ? "طلب نشاط" : "Activity request")}</p>
                <p className="mt-1 text-sm text-slate-500">{request.name} • {request.phone}</p>
                <p className="mt-2 text-sm text-slate-600">{request.message}</p>
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
