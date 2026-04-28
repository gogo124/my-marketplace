import { headers } from "next/headers";
import { AgencyOwnerSidebar } from "@/components/agency-owner-sidebar";
import { WorkspaceAccessState } from "@/components/workspace-access-state";
import { getAuthSession } from "@/lib/auth";
import { getAgencyProfileByUserId } from "@/lib/agency";
import { resolveLocale, withLocale } from "@/lib/i18n";
import { getSessionUser, getUserPermissions } from "@/lib/permissions";

export default async function AgencyOwnerLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAuthSession();
  const requestHeaders = await headers();
  const locale = resolveLocale(requestHeaders.get("x-site-locale") || undefined);

  if (!session?.user?.id) {
    return (
      <WorkspaceAccessState
        locale={locale}
        title={locale === "ar" ? "خاصك تسجل الدخول" : "Connexion requise"}
        body={
          locale === "ar"
            ? "سجل الدخول باش تدخل لمساحة الوكالة وتكمل الملف ديالك."
            : "Connectez-vous pour acceder a l'espace agence et completer votre profil."
        }
        primaryHref="/login"
        primaryLabel={locale === "ar" ? "تسجيل الدخول" : "Se connecter"}
        secondaryHref="/"
        secondaryLabel={locale === "ar" ? "الرجوع للرئيسية" : "Retour a l'accueil"}
      />
    );
  }

  const profile = await getAgencyProfileByUserId(session.user.id);
  const user = getSessionUser(session);
  const permissions = getUserPermissions(user, { hasAgencyProfile: Boolean(profile?._id) });

  if (!permissions.canOpenAgencyProfile) {
    return (
      <WorkspaceAccessState
        locale={locale}
        title={locale === "ar" ? "الحساب ديالك باقي ما مفعلش كوكالة" : "Acces agence non active"}
        body={
          locale === "ar"
            ? "الإدارة خاصها تفعل ليك صلاحية الوكالة أولاً قبل ما تقدر تكمل الملف أو تدخل للوحة."
            : "L'administration doit d'abord activer l'acces agence avant la creation du profil ou l'entree au tableau."
        }
        primaryHref="/dashboard"
        primaryLabel={locale === "ar" ? "رجع للوحة المستخدم" : "Aller au tableau utilisateur"}
        secondaryHref="/"
        secondaryLabel={locale === "ar" ? "الرجوع للرئيسية" : "Retour a l'accueil"}
      />
    );
  }

  return (
    <main className="page-shell grid gap-8 lg:grid-cols-[260px_1fr]">
      <AgencyOwnerSidebar
        isAgency={permissions.canAccessAgencyWorkspace}
        canCreateAgency={permissions.canOpenAgencyProfile}
        publicProfileId={profile?._id}
      />
      <div className="space-y-8">{children}</div>
    </main>
  );
}
