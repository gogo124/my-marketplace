import { redirect } from "next/navigation";
import { AgencyProfileForm } from "@/components/agency-profile-form";
import { getAuthSession } from "@/lib/auth";
import { getAgencyDashboardData } from "@/lib/agency";
import { getDirection, resolveLocale, siteCopy, withLocale } from "@/lib/i18n";
import { getSessionUser, getUserPermissions } from "@/lib/permissions";

export default async function AgencyProfilePage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const copy = siteCopy[locale];
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect(withLocale("/login", locale));
  }

  const dashboard = await getAgencyDashboardData(session.user.id);
  const permissions = getUserPermissions(getSessionUser(session), { hasAgencyProfile: Boolean(dashboard.profile?._id) });

  if (!permissions.canOpenAgencyProfile) {
    redirect(withLocale("/", locale));
  }

  return (
    <div dir={getDirection(locale)} className="space-y-8">
      <section className="relative overflow-hidden rounded-[2.75rem] px-6 py-10 text-white shadow-[0_24px_80px_rgba(15,61,46,0.24)] sm:px-8 sm:py-12">
        <div className="absolute inset-0 bg-[url('/images/agencies.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(7,24,18,0.9),rgba(15,61,46,0.78)_55%,rgba(249,115,22,0.25))]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">
              {permissions.canAccessAgencyWorkspace ? copy.agencyProfileTitle : copy.becomeAnAgency}
            </p>
            <h1 className="mt-4 text-4xl font-black sm:text-5xl">
              {permissions.canAccessAgencyWorkspace ? copy.agencyProfileHeroTitle : copy.becomeAgencyTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">
              {permissions.canAccessAgencyWorkspace ? copy.agencyProfileHeroBody : copy.becomeAgencyBody}
            </p>
          </div>
          <div className="grid gap-3 rounded-[2rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
              {locale === "ar" ? "ملف الوكالة" : "Profil agence"}
            </p>
            <p className="text-sm leading-6 text-white/80">
              {locale === "ar"
                ? "أكمل المعلومات الأساسية وقدم الوكالة بشكل احترافي مع صور واضحة ووسائل تواصل مباشرة."
                : "Completez les informations essentielles avec des images claires et des moyens de contact directs."}
            </p>
          </div>
        </div>
      </section>

      <AgencyProfileForm profile={dashboard.profile} />
    </div>
  );
}
