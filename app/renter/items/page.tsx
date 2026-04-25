import { redirect } from "next/navigation";
import { RentalItemManager } from "@/components/rental-item-manager";
import { getAuthSession } from "@/lib/auth";
import { resolveLocale, withLocale } from "@/lib/i18n";
import { getRenterWorkspaceRedirectPath, getSessionUser } from "@/lib/permissions";
import { getRenterDashboardData } from "@/lib/renter";

export default async function RenterItemsPage({
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
  const redirectPath = getRenterWorkspaceRedirectPath(getSessionUser(session), locale, Boolean(dashboard.profile?._id));

  if (redirectPath) {
    redirect(redirectPath);
  }

  const labels =
    locale === "ar"
      ? {
          kicker: "عناصر الكراء",
          title: "أدر العناصر الفردية وباقات المعدات",
          body: "كل عنصر أو باقة يبقى مرتبطاً بمزود الكراء فقط مع تتبع الكمية والتوفر والتسليم."
        }
      : {
          kicker: "Articles location",
          title: "Gerez les articles individuels et packs equipement",
          body: "Chaque article ou pack reste lie au loueur avec suivi de quantite, disponibilite et livraison."
        };

  return (
    <div className="space-y-8">
      <section className="rounded-[2.75rem] bg-forest px-8 py-10 text-white shadow-card">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">{labels.kicker}</p>
        <h1 className="mt-4 text-4xl font-black">{labels.title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">{labels.body}</p>
      </section>

      <RentalItemManager items={dashboard.items as any[]} locale={locale} />
    </div>
  );
}
