import { headers } from "next/headers";
import { RenterOwnerSidebar } from "@/components/renter-owner-sidebar";
import { WorkspaceAccessState } from "@/components/workspace-access-state";
import { getAuthSession } from "@/lib/auth";
import { resolveLocale, withLocale } from "@/lib/i18n";
import { getSessionUser, getUserPermissions } from "@/lib/permissions";
import { getRenterProfileByUserId } from "@/lib/renter";

export default async function RenterOwnerLayout({
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
            ? "سجل الدخول باش تقدر تدخل لمساحة الكراء وتكمل الملف ديالك."
            : "Connectez-vous pour acceder a l'espace location et completer votre profil."
        }
        primaryHref="/login"
        primaryLabel={locale === "ar" ? "تسجيل الدخول" : "Se connecter"}
        secondaryHref="/"
        secondaryLabel={locale === "ar" ? "الرجوع للرئيسية" : "Retour a l'accueil"}
      />
    );
  }

  const profile = await getRenterProfileByUserId(session.user.id);
  const user = getSessionUser(session);
  const permissions = getUserPermissions(user, { hasRenterProfile: Boolean(profile?._id) });

  if (!permissions.canOpenRenterProfile) {
    return (
      <WorkspaceAccessState
        locale={locale}
        title={locale === "ar" ? "الحساب ديالك باقي ما مفعلش ككرّاي" : "Acces location non active"}
        body={
          locale === "ar"
            ? "الإدارة خاصها تفعل ليك صلاحية الكراء أولاً، ومن بعد تقدر تكمل الملف وتدخل للوحة."
            : "L'administration doit d'abord activer l'acces location pour ce compte avant la creation du profil et l'acces au tableau."
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
      <RenterOwnerSidebar isRenter={permissions.canAccessRenterWorkspace} canCreateRenter={permissions.canOpenRenterProfile} />
      <div className="space-y-8">{children}</div>
    </main>
  );
}
