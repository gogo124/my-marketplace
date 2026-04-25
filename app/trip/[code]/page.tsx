import Image from "next/image";
import Link from "next/link";
import { formatShortDate } from "@/lib/utils";
import { getDirection, resolveLocale, withLocale } from "@/lib/i18n";
import { normalizeTripCode } from "@/lib/trip-code";

export const dynamic = "force-dynamic";

export default async function TripCodePage({
  params,
  searchParams
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { code } = await params;
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const normalizedCode = normalizeTripCode(code);
  const displayCode = normalizedCode || "MT2026";
  const trip = {
    code: displayCode,
    title: locale === "ar" ? "رحلة منظمة إلى مرزوكة" : "Voyage organise vers Merzouga",
    destination: locale === "ar" ? "مرزوكة" : "Merzouga",
    city: locale === "ar" ? "مراكش" : "Marrakech",
    startDate: "2026-05-14",
    endDate: "2026-05-17",
    price: 950,
    seatsLeft: 7,
    description:
      locale === "ar"
        ? "هذه صفحة تعريفية عبر Trip Code لعرض الرحلة والمعدات المرتبطة بها قبل التواصل مع الوكالة."
        : "Page de presentation via Trip Code pour voir le voyage et les equipements associes.",
    coverImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
  };
  const agency = {
    name: locale === "ar" ? "Atlas Travel" : "Atlas Travel",
    city: locale === "ar" ? "مراكش" : "Marrakech",
    description:
      locale === "ar"
        ? "وكالة تنظم رحلات جماعية مع مواكبة قبل وأثناء الرحلة."
        : "Agence specialisee dans les voyages groupes avec accompagnement avant et pendant le sejour.",
    whatsapp: "212612345678",
    logo: "https://images.unsplash.com/photo-1488646953014-85cb44e25828"
  };
  const rentalEquipment = [
    {
      id: "rental-1",
      title: locale === "ar" ? "خيمة لشخصين" : "Tente 2 places",
      category: locale === "ar" ? "كراء" : "Location",
      price: 120,
      status: locale === "ar" ? "متوفر" : "Disponible"
    },
    {
      id: "rental-2",
      title: locale === "ar" ? "كيس نوم" : "Sac de couchage",
      category: locale === "ar" ? "كراء" : "Location",
      price: 60,
      status: locale === "ar" ? "متوفر" : "Disponible"
    },
    {
      id: "rental-3",
      title: locale === "ar" ? "مصباح تخييم" : "Lampe de camping",
      category: locale === "ar" ? "كراء" : "Location",
      price: 35,
      status: locale === "ar" ? "متوفر" : "Disponible"
    }
  ];
  const saleEquipment = [
    {
      id: "sale-1",
      title: locale === "ar" ? "حقيبة سفر" : "Sac a dos",
      category: locale === "ar" ? "بيع" : "Vente",
      price: 240
    },
    {
      id: "sale-2",
      title: locale === "ar" ? "موقد صغير" : "Rechaud compact",
      category: locale === "ar" ? "بيع" : "Vente",
      price: 180
    },
    {
      id: "sale-3",
      title: locale === "ar" ? "كرسي تخييم" : "Chaise pliante",
      category: locale === "ar" ? "بيع" : "Vente",
      price: 95
    }
  ];
  const reservationLink = withLocale("/agencies", locale);
  const agencyWhatsappDigits = agency.whatsapp;

  return (
    <main dir={getDirection(locale)} className="page-shell space-y-8">
      <section className="overflow-hidden rounded-[2.75rem] bg-white shadow-card">
        <div className="relative h-56">
          <Image src={trip.coverImage} alt={trip.title} fill priority sizes="100vw" className="object-cover" />
        </div>
        <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.25em] text-clay">Trip Code</p>
            <h1 className="text-4xl font-black text-ink">{trip.title}</h1>
            <p className="text-sm leading-7 text-ink/65">{trip.description}</p>
            <div className="flex flex-wrap gap-3 text-sm text-ink/70">
              <span className="rounded-full bg-sand px-3 py-1">{trip.destination}</span>
              <span className="rounded-full bg-sand px-3 py-1">{trip.city}</span>
              <span className="rounded-full bg-sand px-3 py-1">{trip.code}</span>
            </div>
          </div>
          <div className="rounded-[2rem] bg-sand p-5">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-[1.2rem] bg-white">
                <Image src={agency.logo} alt={agency.name} fill sizes="56px" className="object-cover" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-ink/45">
                  {locale === "ar" ? "الوكالة" : "Agence"}
                </p>
                <h2 className="text-xl font-black text-ink">{agency.name}</h2>
                <p className="text-sm text-ink/60">{agency.city}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-ink/65">{agency.description}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={reservationLink} className="rounded-full bg-forest px-4 py-2 font-semibold text-white">
                {locale === "ar" ? "الحجز" : "Reservation"}
              </Link>
              <a
                href={`https://wa.me/${agencyWhatsappDigits}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-ink/10 px-4 py-2 font-semibold text-ink"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[2rem] bg-white p-5 shadow-card">
          <p className="text-sm uppercase tracking-[0.25em] text-ink/45">{locale === "ar" ? "الانطلاق" : "Depart"}</p>
          <p className="mt-3 text-lg font-bold text-ink">{formatShortDate(trip.startDate, locale)}</p>
        </div>
        <div className="rounded-[2rem] bg-white p-5 shadow-card">
          <p className="text-sm uppercase tracking-[0.25em] text-ink/45">{locale === "ar" ? "العودة" : "Retour"}</p>
          <p className="mt-3 text-lg font-bold text-ink">{formatShortDate(trip.endDate, locale)}</p>
        </div>
        <div className="rounded-[2rem] bg-white p-5 shadow-card">
          <p className="text-sm uppercase tracking-[0.25em] text-ink/45">{locale === "ar" ? "السعر" : "Prix"}</p>
          <p className="mt-3 text-lg font-bold text-ink">{trip.price} DH</p>
        </div>
        <div className="rounded-[2rem] bg-white p-5 shadow-card">
          <p className="text-sm uppercase tracking-[0.25em] text-ink/45">{locale === "ar" ? "المقاعد المتبقية" : "Places restantes"}</p>
          <p className="mt-3 text-lg font-bold text-ink">{trip.seatsLeft}</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <h2 className="text-2xl font-black text-ink">{locale === "ar" ? "معلومات الرحلة" : "Infos voyage"}</h2>
          <div className="mt-5 space-y-4">
            <div className="rounded-[1.5rem] bg-sand p-4">
              <p className="text-sm font-semibold text-ink">{locale === "ar" ? "الوجهة" : "Destination"}</p>
              <p className="mt-2 text-sm leading-7 text-ink/65">{trip.destination}</p>
            </div>
            <div className="rounded-[1.5rem] bg-sand p-4">
              <p className="text-sm font-semibold text-ink">{locale === "ar" ? "برنامج مختصر" : "Programme court"}</p>
              <p className="mt-2 text-sm leading-7 text-ink/65">
                {locale === "ar"
                  ? "الانطلاق صباحاً من مراكش، التوجه نحو الصحراء، مبيت منظم، وأنشطة خفيفة خلال الرحلة."
                  : "Depart matinal depuis Marrakech, trajet vers le desert, nuit organisee et activites legeres pendant le sejour."}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-sand p-4">
              <p className="text-sm font-semibold text-ink">{locale === "ar" ? "طريقة الوصول للمعدات" : "Acces aux equipements"}</p>
              <p className="mt-2 text-sm leading-7 text-ink/65">
                {locale === "ar"
                  ? "بعد الحجز وتأكيد الوكالة، يتم استخدام Trip Code لعرض المعدات المناسبة للرحلة."
                  : "Apres reservation et confirmation par l'agence, le Trip Code permet de consulter les equipements adaptes au voyage."}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] bg-white p-6 shadow-card">
            <h2 className="text-2xl font-black text-ink">{locale === "ar" ? "معدات الكراء" : "Equipements location"}</h2>
            <div className="mt-5 grid gap-4">
              {rentalEquipment.map((item) => (
                <article key={item.id} className="rounded-[1.5rem] border border-ink/10 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-ink">{item.title}</h3>
                      <p className="mt-1 text-sm text-ink/60">{item.category}</p>
                    </div>
                    <p className="text-sm font-semibold text-clay">{item.price} DH</p>
                  </div>
                  <p className="mt-3 text-sm text-ink/65">{item.status}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-card">
            <h2 className="text-2xl font-black text-ink">{locale === "ar" ? "معدات للبيع" : "Equipements vente"}</h2>
            <div className="mt-5 grid gap-4">
              {saleEquipment.map((item) => (
                <article key={item.id} className="rounded-[1.5rem] border border-ink/10 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-ink">{item.title}</h3>
                      <p className="mt-1 text-sm text-ink/60">{item.category}</p>
                    </div>
                    <p className="text-sm font-semibold text-clay">{item.price} DH</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
