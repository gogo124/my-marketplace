import Link from "next/link";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { RentalItemCard } from "@/components/rental-item-card";
import { RentalRequestForm } from "@/components/rental-request-form";
import { getAuthSession } from "@/lib/auth";
import { getRentalTripPageData } from "@/lib/renter";
import { resolveAuthorizedRentalTrip } from "@/lib/rental-access";
import { formatLocaleDate, formatLocaleNumber, getDirection, resolveLocale, siteCopy, withLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function RentalTripPage({
  params,
  searchParams
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { tripId } = await params;
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const copy = siteCopy[locale];
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect(withLocale("/login", locale));
  }

  const access = await resolveAuthorizedRentalTrip({
    userId: session.user.id,
    tripId
  });

  if ("error" in access) {
    redirect(withLocale("/rentals", locale));
  }

  const data = await getRentalTripPageData(tripId);

  if (!data) {
    notFound();
  }

  const labels =
    locale === "ar"
      ? {
          kicker: "معدات هذه الرحلة",
          title: "معدات الكراء المرتبطة بهذه الرحلة",
          body: "تصفح العناصر المتاحة للمسافرين في هذه الرحلة. التواصل وطلب الكراء يتطلبان تسجيل الدخول.",
          linkedItems: "العناصر المرتبطة",
          noItems: "لا توجد عناصر كراء متاحة لهذه الرحلة حالياً.",
          requestCard: "أرسل طلب كراء لهذا العنصر"
        }
      : {
          kicker: "Equipement du voyage",
          title: "Articles de location lies a ce voyage",
          body: "Parcourez les articles disponibles pour ce voyage. Le contact et la demande de location exigent une connexion.",
          linkedItems: "Articles lies",
          noItems: "Aucun article de location n'est disponible pour ce voyage pour le moment.",
          requestCard: "Envoyer une demande pour cet article"
        };

  const trip = data.trip as any;
  const items = data.items as any[];

  return (
    <main dir={getDirection(locale)} className="page-shell space-y-8">
      <section className="image-surface rounded-[2.75rem] px-8 py-10 text-white shadow-card">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">{labels.kicker}</p>
        <h1 className="mt-4 text-4xl font-black">{trip.title}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/75">{labels.body}</p>
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">{copy.destination}</p>
            <p className="mt-2 font-semibold">{trip.destination}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">{copy.city}</p>
            <p className="mt-2 font-semibold">{trip.city}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">{copy.startDate}</p>
            <p className="mt-2 font-semibold">{formatLocaleDate(trip.startDate, locale)}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">{copy.endDate}</p>
            <p className="mt-2 font-semibold">{formatLocaleDate(trip.endDate, locale)}</p>
          </div>
        </div>
        {trip.description ? <p className="mt-6 max-w-4xl text-sm leading-7 text-white/75">{trip.description}</p> : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={withLocale("/rentals", locale)} className="rounded-full bg-white px-5 py-3 font-semibold text-forest">
            {copy.rent}
          </Link>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-ink">{labels.linkedItems}</h2>
          <p className="text-sm text-ink/60">{formatLocaleNumber(items.length, locale)} items</p>
        </div>

        {items.length > 0 ? (
          <div className="grid gap-6">
            {items.map((item: any) => (
              <article key={item._id} className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                <RentalItemCard item={item} locale={locale} isSignedIn={Boolean(session?.user)} authorizedTripId={String(trip._id)} />
                <div className="rounded-[2rem] bg-white p-5 shadow-card">
                  <p className="text-sm font-semibold text-ink">{labels.requestCard}</p>
                  <RentalRequestForm
                    tripTitle={trip.title}
                    isSignedIn={Boolean(session?.user)}
                    hideTripCodeInput
                    tripId={String(trip._id)}
                    lockedRenterId={item.renter?._id ? String(item.renter._id) : String(item.renter)}
                    lockedRentalItemId={String(item._id)}
                    defaultName={session?.user?.name || ""}
                    partners={[
                      {
                        _id: item.renter?._id ? String(item.renter._id) : String(item.renter),
                        name: item.renter?.name,
                        recommendedItems: [
                          {
                            _id: String(item._id),
                            title: item.title,
                            price: Number(item.price || 0),
                            quantityAvailable: Number(item.quantityAvailable || 0)
                          }
                        ]
                      }
                    ]}
                  />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-ink/20 bg-white p-10 text-center text-sm text-ink/60 shadow-card">
            {labels.noItems}
          </div>
        )}
      </section>
    </main>
  );
}
