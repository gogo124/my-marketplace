import { AgencyTripManager } from "@/components/agency-trip-manager";
import { AgencyStatsGrid } from "@/components/agency-owner-sections";
import { WorkspaceAccessState } from "@/components/workspace-access-state";
import { getAuthSession } from "@/lib/auth";
import { getAgencyDashboardData } from "@/lib/agency";
import { getDirection, resolveLocale, siteCopy, withLocale } from "@/lib/i18n";
import { getSessionUser, getUserPermissions } from "@/lib/permissions";

export default async function AgencyTripsPage({
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
        body={locale === "ar" ? "سجل الدخول باش تدير الرحلات ديالك." : "Connectez-vous pour gerer vos voyages."}
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
        body={locale === "ar" ? "قبل ما تنشر الرحلات، خاصك تكمل ملف الوكالة ديالك." : "Avant de publier des voyages, vous devez completer votre profil agence."}
        primaryHref="/agency/profile"
        primaryLabel={locale === "ar" ? "كمل ملف الوكالة" : "Completer le profil"}
        secondaryHref="/agency/dashboard"
        secondaryLabel={locale === "ar" ? "لوحة الوكالة" : "Tableau agence"}
      />
    );
  }

  return (
    <div dir={getDirection(locale)} className="space-y-8">
      <section className="relative overflow-hidden rounded-[2.75rem] px-6 py-10 text-white shadow-[0_24px_80px_rgba(15,61,46,0.24)] sm:px-8 sm:py-12">
        <div className="absolute inset-0 bg-[url('/images/hero-main.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(7,24,18,0.9),rgba(15,61,46,0.75)_55%,rgba(249,115,22,0.25))]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">{copy.agencyTripsTitle}</p>
            <h1 className="mt-4 text-4xl font-black sm:text-5xl">{copy.agencyTripsHeroTitle}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">{copy.agencyTripsHeroBody}</p>
          </div>
          <div className="grid gap-3 rounded-[2rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
              {locale === "ar" ? "نشر الرحلات" : "Publier des voyages"}
            </p>
            <p className="text-sm leading-6 text-white/80">
              {locale === "ar"
                ? "اعرض التواريخ، المقاعد المتبقية، ومساحة التريب بطريقة واضحة ومقنعة."
                : "Mettez en avant les dates, les places restantes et l'Espace Trip de maniere claire."}
            </p>
          </div>
        </div>
      </section>

      <AgencyStatsGrid stats={dashboard.stats} locale={locale} />
      <AgencyTripManager
        trips={dashboard.trips as any[]}
        renterPartners={((dashboard.partnerships as any)?.accepted || []) as any[]}
        globalLinkedRenterPartnerIds={(dashboard.profile as any)?.linkedRenterPartners || []}
        globalTrustedRenterPartnerIds={(dashboard.profile as any)?.trustedRenterPartners || []}
        globalRecommendedRenterPartnerIds={(dashboard.profile as any)?.recommendedRenterPartners || []}
        locale={locale}
      />
    </div>
  );
}
