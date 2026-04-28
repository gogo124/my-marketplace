import { RentalItemManager } from "@/components/rental-item-manager";
import { WorkspaceAccessState } from "@/components/workspace-access-state";
import { getAuthSession } from "@/lib/auth";
import { resolveLocale, withLocale } from "@/lib/i18n";
import { getSessionUser, getUserPermissions } from "@/lib/permissions";
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
    return (
      <WorkspaceAccessState
        locale={locale}
        title={locale === "ar" ? "خاصك تسجل الدخول" : "Connexion requise"}
        body={locale === "ar" ? "سجل الدخول باش تدير معدات الكراء ديالك." : "Connectez-vous pour gerer votre materiel de location."}
        primaryHref="/login"
        primaryLabel={locale === "ar" ? "تسجيل الدخول" : "Se connecter"}
        secondaryHref="/"
        secondaryLabel={locale === "ar" ? "الرجوع للرئيسية" : "Retour a l'accueil"}
      />
    );
  }

  const dashboard = await getRenterDashboardData(session.user.id);
  const permissions = getUserPermissions(getSessionUser(session), { hasRenterProfile: Boolean(dashboard.profile?._id) });

  if (!permissions.canOpenRenterProfile) {
    return (
      <WorkspaceAccessState
        locale={locale}
        title={locale === "ar" ? "الحساب ديالك باقي ما مفعلش ككرّاي" : "Acces location non active"}
        body={
          locale === "ar"
            ? "صلاحية الكراء مازال ما تفعّلاتش فهاد الحساب."
            : "L'acces location n'est pas encore active pour ce compte."
        }
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
        title={locale === "ar" ? "خاصك تكمل ملف الكراء" : "Profil location requis"}
        body={
          locale === "ar"
            ? "قبل ما تزيد عناصر الكراء، خاصك تكمل ملف الكراء ديالك."
            : "Avant d'ajouter des articles location, vous devez completer votre profil location."
        }
        primaryHref="/renter/profile"
        primaryLabel={locale === "ar" ? "كمل ملف الكراء" : "Completer le profil"}
        secondaryHref="/renter/dashboard"
        secondaryLabel={locale === "ar" ? "لوحة الكراء" : "Tableau location"}
      />
    );
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
      <section className="image-surface rounded-[2.75rem] px-8 py-10 text-white shadow-card">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">{labels.kicker}</p>
        <h1 className="mt-4 text-4xl font-black">{labels.title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">{labels.body}</p>
      </section>

      <RentalItemManager items={dashboard.items as any[]} locale={locale} />
    </div>
  );
}
