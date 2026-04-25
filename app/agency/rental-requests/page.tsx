import { redirect } from "next/navigation";
import { AgencyRentalRequestsSection, AgencyStatsGrid } from "@/components/agency-owner-sections";
import { getAuthSession } from "@/lib/auth";
import { getAgencyDashboardData } from "@/lib/agency";
import { getDirection, resolveLocale, siteCopy, withLocale } from "@/lib/i18n";
import { getAgencyWorkspaceRedirectPath, getSessionUser } from "@/lib/permissions";

export default async function AgencyRentalRequestsPage({
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
  const redirectPath = getAgencyWorkspaceRedirectPath(getSessionUser(session), locale, Boolean(dashboard.profile?._id));

  if (redirectPath) {
    redirect(redirectPath);
  }

  return (
    <div dir={getDirection(locale)} className="space-y-8">
      <section className="rounded-[2.75rem] bg-forest px-8 py-10 text-white shadow-card">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">{locale === "ar" ? "طلبات الكراء" : "Demandes location"}</p>
        <h1 className="mt-4 text-4xl font-black">{locale === "ar" ? "راجع طلبات الكراء المرتبطة برحلاتك" : "Consultez les demandes location liees a vos voyages"}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">{copy.agencyLeadsHeroBody}</p>
      </section>

      <AgencyStatsGrid stats={dashboard.stats} locale={locale} />
      <AgencyRentalRequestsSection rentalRequests={dashboard.rentalRequests as any[]} locale={locale} />
    </div>
  );
}
