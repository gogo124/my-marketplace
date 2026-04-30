import { ActivityOwnerSidebar } from "@/components/activity-owner-sidebar";
import { getAuthSession } from "@/lib/auth";
import { getActivityProviderAccessSnapshot } from "@/lib/activity";
import { resolveLocale } from "@/lib/i18n";
import { WorkspaceAccessState } from "@/components/workspace-access-state";

export default async function ActivityLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAuthSession();
  const locale = resolveLocale(undefined);

  if (!session?.user?.id) {
    return (
      <WorkspaceAccessState
        locale={locale}
        title={locale === "ar" ? "خاصك تسجل الدخول" : "Connexion requise"}
        body={locale === "ar" ? "سجل الدخول باش تدخل لمساحة الأنشطة." : "Connectez-vous pour acceder a l'espace activites."}
        primaryHref="/login"
        primaryLabel={locale === "ar" ? "تسجيل الدخول" : "Se connecter"}
        secondaryHref="/activities"
        secondaryLabel={locale === "ar" ? "الأنشطة" : "Activities"}
      />
    );
  }

  const access = getActivityProviderAccessSnapshot(session.user as any);

  return (
    <main className="page-shell grid gap-8 lg:grid-cols-[260px_1fr]">
      <ActivityOwnerSidebar hasAccess={access.isActive} />
      <div className="space-y-8">{children}</div>
    </main>
  );
}
