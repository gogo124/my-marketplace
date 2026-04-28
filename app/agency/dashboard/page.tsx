import Link from "next/link";
import {
  DashboardHero,
  DashboardQuickLinks
} from "@/components/dashboard/dashboard-primitives";
import { AgencyOverviewSection, AgencyReservationsSection, AgencyStatsGrid } from "@/components/agency-owner-sections";
import { StatusBadge } from "@/components/status-badge";
import { PartnershipManager } from "@/components/partnership-manager";
import { WorkspaceAccessState } from "@/components/workspace-access-state";
import { getAuthSession } from "@/lib/auth";
import { getAgencyDashboardData } from "@/lib/agency";
import { getDirection, resolveLocale, siteCopy, withLocale } from "@/lib/i18n";
import { getSessionUser, getUserPermissions } from "@/lib/permissions";

export default async function AgencyDashboardPage({
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
        body={locale === "ar" ? "سجل الدخول باش تدخل للوحة الوكالة." : "Connectez-vous pour acceder au tableau agence."}
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
        body={
          locale === "ar"
            ? "باش تدخل للوحة الوكالة، خاص الإدارة تفعل ليك هاد الصلاحية أولاً."
            : "L'administration doit d'abord activer l'acces agence pour ouvrir ce tableau."
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
        title={locale === "ar" ? "خاصك تكمل ملف الوكالة" : "Profil agence requis"}
        body={
          locale === "ar"
            ? "تم تفعيل صلاحية الوكالة، وباقي خاصك تكمل ملف الوكالة باش تولي تقدر تنشر الرحلات وتدير الحجوزات."
            : "L'acces agence est active, mais vous devez completer le profil agence pour publier des voyages et gerer les reservations."
        }
        primaryHref="/agency/profile"
        primaryLabel={locale === "ar" ? "كمل ملف الوكالة" : "Completer le profil"}
        secondaryHref="/dashboard"
        secondaryLabel={locale === "ar" ? "رجع للوحة المستخدم" : "Tableau utilisateur"}
      />
    );
  }

  const cards = [
    { href: "/agency/trips", label: copy.trips, value: dashboard.stats.tripsCount, note: locale === "ar" ? "الرحلات ومساحة التريب" : "Trips and Trip Space" },
    { href: "/agency/reservations", label: copy.reservations, value: dashboard.stats.reservationsCount, note: locale === "ar" ? "إدارة الحجوزات" : "Manage reservations" },
    { href: "/agency/rental-requests", label: locale === "ar" ? "طلبات الكراء" : "Demandes location", value: dashboard.stats.rentalRequestsCount, note: locale === "ar" ? "مرتبطة برحلاتك" : "Linked to your trips" }
  ];

  return (
    <div dir={getDirection(locale)} className="space-y-8">
      <DashboardHero
        kicker={locale === "ar" ? "لوحة الوكالة" : "Agency workspace"}
        title={copy.agencyDashboardTitle}
        body={copy.agencyDashboardBody}
        locale={locale}
        chips={[
          `${dashboard.stats.tripsCount} ${locale === "ar" ? "رحلة" : "trips"}`,
          `${dashboard.stats.reservationsCount} ${locale === "ar" ? "حجز" : "reservations"}`,
          `${dashboard.stats.messagesCount || 0} ${locale === "ar" ? "رسالة" : "messages"}`
        ]}
        actions={[
          { href: "/agency/trips", label: copy.trips },
          { href: "/agency/reservations", label: copy.reservations }
        ]}
      />

      <section className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={withLocale(card.href, locale)} className="rounded-[2rem] bg-white p-6 shadow-card">
            <p className="text-sm text-ink/50">{card.label}</p>
            <p className="mt-3 text-3xl font-black text-ink">{card.value || 0}</p>
            <p className="mt-2 text-sm text-ink/60">{card.note}</p>
          </Link>
        ))}
      </section>

      <DashboardQuickLinks
        locale={locale}
        items={[
          { href: "/agency/trips", label: copy.trips, note: locale === "ar" ? "إدارة الرحلات" : "Manage trips" },
          { href: "/agency/reservations", label: copy.reservations, note: locale === "ar" ? "متابعة الحجوزات" : "Track reservations" },
          { href: "/agency/leads", label: copy.leads, note: locale === "ar" ? "طلبات التواصل" : "Contact leads" },
          { href: "/agency/profile", label: copy.agencyProfile, note: locale === "ar" ? "الملف العام" : "Public profile" }
        ]}
      />

      <AgencyStatsGrid stats={dashboard.stats as any} locale={locale} />
      <AgencyOverviewSection
        stats={dashboard.stats as any}
        leadsByType={(dashboard.stats as any).leadsByType || {}}
        locale={locale}
      />
      <AgencyReservationsSection reservations={dashboard.reservations as any[]} locale={locale} />

      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-ink">{locale === "ar" ? "المراجعات والتقييم" : "Avis et note"}</h2>
            <p className="mt-2 text-sm text-ink/60">
              {locale === "ar" ? "ملخص مراجعات هذا الحساب داخل المنصة." : "Resume des avis lies a ce compte dans la plateforme."}
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-sand px-5 py-4 text-right">
            <p className="text-sm text-ink/50">{locale === "ar" ? "المعدل" : "Moyenne"}</p>
            <p className="mt-2 text-3xl font-black text-clay">{(dashboard as any).reviewsSummary?.averageRating || 0}/5</p>
          </div>
        </div>
        {(dashboard as any).reviews?.length > 0 ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {(dashboard as any).reviews.slice(0, 6).map((review: any) => (
              <article key={review._id} className="rounded-[1.5rem] border border-ink/10 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{review.listing?.title || review.place?.name || (locale === "ar" ? "مراجعة" : "Avis")}</p>
                    <p className="mt-1 text-sm text-ink/60">{review.rating}/5</p>
                    <p className="mt-2 text-sm text-ink/70 line-clamp-3">{review.comment}</p>
                  </div>
                  <StatusBadge kind="review" status={review.status} locale={locale} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-ink/60">{locale === "ar" ? "لا توجد مراجعات بعد." : "Pas encore d'avis."}</p>
        )}
      </section>

      <PartnershipManager
        role="agency"
        directory={(dashboard.partnerships as any).directory || []}
        accepted={(dashboard.partnerships as any).accepted || []}
        incomingRequests={(dashboard.partnerships as any).incomingRequests || []}
        outgoingRequests={(dashboard.partnerships as any).outgoingRequests || []}
        locale={locale}
      />
    </div>
  );
}
