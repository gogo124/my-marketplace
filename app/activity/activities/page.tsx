import { ActivityManager } from "@/components/activity-manager";
import { WorkspaceAccessState } from "@/components/workspace-access-state";
import { getAuthSession } from "@/lib/auth";
import { getActivityDashboardData } from "@/lib/activity";
import { resolveLocale } from "@/lib/i18n";

export default async function ActivityActivitiesPage({
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
        body={isArabic ? "سجل الدخول باش تدير الأنشطة ديالك." : "Connectez-vous pour gerer vos activites."}
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
        body={isArabic ? "إدارة الأنشطة متاحة فقط بعد التفعيل." : "Activity management is only available after activation."}
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
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">{isArabic ? "أنشطتي" : "My activities"}</p>
        <h1 className="mt-4 text-4xl font-black">{isArabic ? "أدر بطاقات الأنشطة والصور" : "Manage activities and images"}</h1>
      </section>
      <ActivityManager activities={dashboard.activities as any[]} />
    </div>
  );
}
