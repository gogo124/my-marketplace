import { redirect } from "next/navigation";
import { RenterProfileForm } from "@/components/renter-profile-form";
import { getAuthSession } from "@/lib/auth";
import { resolveLocale, withLocale } from "@/lib/i18n";
import { getSessionUser, getUserPermissions } from "@/lib/permissions";
import { getRenterDashboardData } from "@/lib/renter";

export default async function RenterProfilePage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect(withLocale("/login", locale));
  }

  const dashboard = await getRenterDashboardData(session.user.id);
  const permissions = getUserPermissions(getSessionUser(session), { hasRenterProfile: Boolean(dashboard.profile?._id) });

  if (!permissions.canOpenRenterProfile) {
    redirect(withLocale("/", locale));
  }
  const labels =
    locale === "ar"
      ? {
          kicker: permissions.canAccessRenterWorkspace ? "ملف مزود الكراء" : "انضم كشريك كراء",
          title: permissions.canAccessRenterWorkspace ? "أدر ملف الكراء الخاص بك" : "أنشئ ملفاً مستقلاً للكراء",
          body: "يبقى هذا المسار منفصلاً عن الوكالات، مع لوحة وعناصر كراء خاصة به."
        }
      : {
          kicker: permissions.canAccessRenterWorkspace ? "Profil location" : "Devenir partenaire location",
          title: permissions.canAccessRenterWorkspace ? "Gerez votre profil location" : "Creez un profil location separe",
          body: "Ce parcours reste separe des agences avec son propre tableau de bord et ses propres articles."
        };

  return (
    <div className="space-y-8">
      <section className="image-surface rounded-[2.75rem] px-8 py-10 text-white shadow-card">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">{labels.kicker}</p>
        <h1 className="mt-4 text-4xl font-black">{labels.title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">{labels.body}</p>
      </section>

      <RenterProfileForm profile={dashboard.profile as any} />
    </div>
  );
}
