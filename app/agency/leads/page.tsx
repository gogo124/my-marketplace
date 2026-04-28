import { AgencyLeadsSection, AgencyStatsGrid } from "@/components/agency-owner-sections";
import { WorkspaceAccessState } from "@/components/workspace-access-state";
import { getAuthSession } from "@/lib/auth";
import { getAgencyDashboardData } from "@/lib/agency";
import { getDirection, resolveLocale, siteCopy, withLocale } from "@/lib/i18n";
import { getSessionUser, getUserPermissions } from "@/lib/permissions";

export default async function AgencyLeadsPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const copy = siteCopy[locale];
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return (
      <WorkspaceAccessState
        locale={locale}
        title={locale === "ar" ? "خاصك تسجل الدخول" : "Connexion requise"}
        body={locale === "ar" ? "سجل الدخول باش تشوف الطلبات والرسائل." : "Connectez-vous pour voir les leads et messages."}
        primaryHref="/login"
        primaryLabel={locale === "ar" ? "تسجيل الدخول" : "Se connecter"}
        secondaryHref="/"
        secondaryLabel={locale === "ar" ? "الرجوع للرئيسية" : "Retour a l'accueil"}
      />
    );
  }

  const dashboard = await getAgencyDashboardData(session.user.id);
  const permissions = getUserPermissions(getSessionUser(session), { hasAgencyProfile: Boolean(dashboard.profile?._id) });

  if (!permissions.canOpenAgencyProfile) {
    return (
      <WorkspaceAccessState
        locale={locale}
        title={locale === "ar" ? "الحساب ديالك باقي ما مفعلش كوكالة" : "Acces agence non active"}
        body={locale === "ar" ? "صلاحية الوكالة مازال ما تفعّلاتش فهاد الحساب." : "L'acces agence n'est pas encore active pour ce compte."}
        primaryHref="/dashboard"
        primaryLabel={locale === "ar" ? "رجع للوحة المستخدم" : "Aller au tableau utilisateur"}
        secondaryHref="/"
        secondaryLabel={locale === "ar" ? "الرجوع للرئيسية" : "Retour a l'accueil"}
      />
    );
  }

  if (!dashboard.profile?._id) {
    return (
      <WorkspaceAccessState
        locale={locale}
        title={locale === "ar" ? "خاصك تكمل ملف الوكالة" : "Profil agence requis"}
        body={locale === "ar" ? "قبل ما تشوف الطلبات، خاصك تكمل ملف الوكالة ديالك." : "Avant de consulter les leads, vous devez completer votre profil agence."}
        primaryHref="/agency/profile"
        primaryLabel={locale === "ar" ? "كمل ملف الوكالة" : "Completer le profil"}
        secondaryHref="/agency/dashboard"
        secondaryLabel={locale === "ar" ? "لوحة الوكالة" : "Tableau agence"}
      />
    );
  }

  return (
    <div dir={getDirection(locale)} className="space-y-8">
      <section className="image-surface rounded-[2.75rem] px-8 py-10 text-white shadow-card">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">{copy.agencyLeadsTitle}</p>
        <h1 className="mt-4 text-4xl font-black">{copy.agencyLeadsHeroTitle}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">{copy.agencyLeadsHeroBody}</p>
      </section>

      <AgencyStatsGrid stats={dashboard.stats} locale={locale} />
      <AgencyLeadsSection
        leads={dashboard.leads as any[]}
        conversations={dashboard.conversations as any[]}
        locale={locale}
      />
    </div>
  );
}
