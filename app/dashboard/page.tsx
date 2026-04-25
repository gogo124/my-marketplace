import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { getDirection, resolveLocale, withLocale } from "@/lib/i18n";
import { getUserDashboardData } from "@/lib/user-dashboard";
import { StatusBadge } from "@/components/status-badge";

export default async function UserDashboardPage({
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

  const dashboard = await getUserDashboardData(session.user.id);

  const labels =
    locale === "ar"
      ? {
          title: "لوحتي",
          body: "ملخص الحجوزات، طلبات الكراء، الأماكن المحفوظة، والمراجعات.",
          reservations: "الحجوزات",
          rentalRequests: "طلبات الكراء",
          savedPlaces: "الأماكن المحفوظة",
          reviews: "المراجعات",
          empty: "لا توجد بيانات بعد."
        }
      : {
          title: "Mon tableau",
          body: "Resume de vos reservations, demandes location, lieux sauvegardes et avis.",
          reservations: "Reservations",
          rentalRequests: "Demandes location",
          savedPlaces: "Lieux sauvegardes",
          reviews: "Avis",
          empty: "Aucune donnee pour le moment."
        };

  return (
    <div dir={getDirection(locale)} className="space-y-8">
      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <h1 className="text-3xl font-black text-ink">{labels.title}</h1>
        <p className="mt-3 text-sm text-ink/60">{labels.body}</p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[2rem] bg-white p-6 shadow-card"><p className="text-sm text-ink/50">{labels.reservations}</p><p className="mt-3 text-3xl font-black text-ink">{dashboard.stats.reservationsCount}</p></div>
        <div className="rounded-[2rem] bg-white p-6 shadow-card"><p className="text-sm text-ink/50">{labels.rentalRequests}</p><p className="mt-3 text-3xl font-black text-ink">{dashboard.stats.rentalRequestsCount}</p></div>
        <div className="rounded-[2rem] bg-white p-6 shadow-card"><p className="text-sm text-ink/50">{labels.savedPlaces}</p><p className="mt-3 text-3xl font-black text-ink">{dashboard.stats.savedPlacesCount}</p></div>
        <div className="rounded-[2rem] bg-white p-6 shadow-card"><p className="text-sm text-ink/50">{labels.reviews}</p><p className="mt-3 text-3xl font-black text-ink">{dashboard.stats.reviewsCount}</p></div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[2rem] bg-white p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-ink">{labels.reservations}</h2>
            <span className="text-sm text-ink/50">{dashboard.reservations.length}</span>
          </div>
          {dashboard.reservations.length > 0 ? (
            <div className="mt-6 grid gap-4">
              {dashboard.reservations.slice(0, 6).map((reservation: any) => (
                <article key={reservation._id} className="rounded-[1.5rem] border border-ink/10 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{reservation.trip?.title || labels.reservations}</p>
                      <p className="mt-1 text-sm text-ink/60">{reservation.agency?.name || "-"}</p>
                      <p className="mt-1 text-sm text-ink/60">{reservation.seats} • {reservation.totalPrice || 0} DH</p>
                    </div>
                    <StatusBadge kind="reservation" status={reservation.status} locale={locale} />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-ink/60">{labels.empty}</p>
          )}
        </section>

        <section className="rounded-[2rem] bg-white p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-ink">{labels.rentalRequests}</h2>
            <span className="text-sm text-ink/50">{dashboard.rentalRequests.length}</span>
          </div>
          {dashboard.rentalRequests.length > 0 ? (
            <div className="mt-6 grid gap-4">
              {dashboard.rentalRequests.slice(0, 6).map((request: any) => (
                <article key={request._id} className="rounded-[1.5rem] border border-ink/10 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{request.trip?.title || labels.rentalRequests}</p>
                      <p className="mt-1 text-sm text-ink/60">{request.rentalItem?.title || "-"}</p>
                      <p className="mt-1 text-sm text-ink/60">{request.quantity || 1} • {request.durationDays || 1} • {request.totalPrice || 0} DH</p>
                    </div>
                    <StatusBadge kind="rental" status={request.status} locale={locale} />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-ink/60">{labels.empty}</p>
          )}
        </section>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[2rem] bg-white p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-ink">{labels.savedPlaces}</h2>
            <span className="text-sm text-ink/50">{dashboard.savedPlaces.length}</span>
          </div>
          {dashboard.savedPlaces.length > 0 ? (
            <div className="mt-6 grid gap-4">
              {dashboard.savedPlaces.slice(0, 6).map((place: any) => (
                <Link key={place._id} href={withLocale(`/camping/${place._id}`, locale)} className="rounded-[1.5rem] border border-ink/10 p-4 transition hover:bg-sand/40">
                  <p className="font-semibold text-ink">{place.name}</p>
                  <p className="mt-1 text-sm text-ink/60">{place.city} • {place.category}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-ink/60">{labels.empty}</p>
          )}
        </section>

        <section className="rounded-[2rem] bg-white p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-ink">{labels.reviews}</h2>
            <span className="text-sm text-ink/50">{dashboard.reviews.length}</span>
          </div>
          {dashboard.reviews.length > 0 ? (
            <div className="mt-6 grid gap-4">
              {dashboard.reviews.slice(0, 6).map((review: any) => (
                <article key={review._id} className="rounded-[1.5rem] border border-ink/10 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{review.listing?.title || review.place?.name || labels.reviews}</p>
                      <p className="mt-1 text-sm text-ink/60">{review.rating}/5</p>
                      <p className="mt-2 text-sm text-ink/70 line-clamp-3">{review.comment}</p>
                    </div>
                    <StatusBadge kind="review" status={review.status} locale={locale} />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-ink/60">{labels.empty}</p>
          )}
        </section>
      </section>
    </div>
  );
}
