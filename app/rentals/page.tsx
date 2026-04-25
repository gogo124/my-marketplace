import Link from "next/link";
import { RentalItemCard } from "@/components/rental-item-card";
import { RentalTripAccessForm } from "@/components/rental-trip-access-form";
import { getAuthSession } from "@/lib/auth";
import { getPublicRentalItems } from "@/lib/renter";
import { formatLocaleNumber, getDirection, resolveLocale, withLocale } from "@/lib/i18n";

export default async function RentalsPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string; q?: string; city?: string; availability?: string }>;
}) {
  const { lang, q = "", city = "", availability = "" } = await searchParams;
  const locale = resolveLocale(lang);
  const session = await getAuthSession();
  const labels =
    locale === "ar"
      ? {
          kicker: "معدات الكراء",
          title: "كراء معدات الرحلات المنظمة",
          body: "هذه الخدمة مخصصة للمستخدمين المشاركين في رحلات منظمة مع وكالات سياحية.",
          notice: "باش تستافد من الكراء، خاصك تكون حاجز رحلة منظمة وعندك كود الرحلة من الوكالة.",
          search: "ابحث عن معدات أو مقاس",
          city: "المدينة",
          all: "كل الحالات",
          available: "متوفر",
          limited: "محدود",
          unavailable: "غير متوفر",
          filter: "تصفية",
          tripCodeLabel: "أدخل كود الرحلة",
          tripCodePlaceholder: "أدخل كود الرحلة",
          openTrip: "عرض المعدات المرتبطة بالرحلة",
          invalidTripCode: "رمز الرحلة غير صالح.",
          empty: "لا توجد معدات مطابقة حالياً.",
          manage: "إدارة عناصرك"
        }
      : {
          kicker: "Equipement location",
          title: "Parcourez l'equipement de location dans une presentation claire",
          body: "Tous les visiteurs peuvent comparer les articles disponibles, voir le prix par jour et contacter directement les loueurs.",
          search: "Rechercher un article ou une taille",
          city: "Ville",
          all: "Tous les statuts",
          available: "Disponible",
          limited: "Limite",
          unavailable: "Indisponible",
          filter: "Filtrer",
          tripCodeLabel: "Code voyage",
          tripCodePlaceholder: "Entrez le code voyage",
          openTrip: "Ouvrir les locations du voyage",
          invalidTripCode: "Invalid trip code",
          empty: "Aucun equipement ne correspond pour le moment.",
          manage: "Gerer vos articles"
        };

  const items = await getPublicRentalItems({ q, city, availability });

  return (
    <main dir={getDirection(locale)} className="page-shell space-y-8">
      <section className="rounded-[2.75rem] bg-forest px-8 py-10 px-5 sm:px-8 text-white shadow-card">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">{labels.kicker}</p>
        <h1 className="mt-4 text-4xl text-3xl font-black sm:text-4xl">{labels.title}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/75">{labels.body}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={withLocale("/renter/items", locale)} className="rounded-full bg-white px-5 py-3 font-semibold text-forest">
            {labels.manage}
          </Link>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-5 shadow-card">
        {locale === "ar" ? (
          <div className="mb-5 rounded-[1.5rem] border border-forest/10 bg-sand/40 p-4">
            <p className="text-sm font-semibold text-ink">{labels.notice}</p>
          </div>
        ) : null}
        <RentalTripAccessForm
          label={labels.tripCodeLabel}
          placeholder={labels.tripCodePlaceholder}
          buttonLabel={labels.openTrip}
          invalidLabel={labels.invalidTripCode}
        />
        <form className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.7fr_auto]">
          <input type="hidden" name="lang" value={locale} />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder={labels.search}
            className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
          />
          <input
            type="text"
            name="city"
            defaultValue={city}
            placeholder={labels.city}
            className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
          />
          <select
            name="availability"
            defaultValue={availability}
            className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
          >
            <option value="">{labels.all}</option>
            <option value="available">{labels.available}</option>
            <option value="limited">{labels.limited}</option>
            <option value="unavailable">{labels.unavailable}</option>
          </select>
          <button className="rounded-2xl bg-clay px-5 py-3 font-semibold text-white">{labels.filter}</button>
        </form>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink/60">{formatLocaleNumber(items.length, locale)} items</p>
        </div>
        {items.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item: any) => (
              <RentalItemCard key={item._id} item={item} locale={locale} isSignedIn={Boolean(session?.user)} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-ink/20 bg-white p-10 text-center text-sm text-ink/60 shadow-card">
            {labels.empty}
          </div>
        )}
      </section>
    </main>
  );
}
