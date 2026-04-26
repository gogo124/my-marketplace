import Image from "next/image";
import Link from "next/link";
import { RentalItemCard } from "@/components/rental-item-card";
import { RentalTripAccessForm } from "@/components/rental-trip-access-form";
import { getAuthSession } from "@/lib/auth";
import { getPublicRentalItems } from "@/lib/renter";
import { formatLocaleNumber, getDirection, resolveLocale, withLocale } from "@/lib/i18n";
import { logServerError } from "@/lib/server-log";

export default async function RentalsPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string; q?: string; city?: string; availability?: string; category?: string; sort?: string }>;
}) {
  const { lang, q = "", city = "", availability = "", category = "", sort = "newest" } = await searchParams;
  const locale = resolveLocale(lang);
  const session = await getAuthSession().catch((error) => {
    logServerError("page.rentals.auth", error, { locale });
    return null;
  });
  const labels =
    locale === "ar"
      ? {
          kicker: "معدات الكراء",
          title: "كراء معدات الرحلات المنظمة",
          body: "هذه الخدمة مخصصة للمستخدمين المشاركين في رحلات منظمة مع وكالات سياحية.",
          notice: "باش تستافد من الكراء، خاصك تكون حاجز رحلة منظمة وعندك كود الرحلة من الوكالة.",
          search: "ابحث عن معدات أو مقاس",
          city: "المدينة",
          category: "الفئة",
          all: "كل الحالات",
          available: "متوفر",
          limited: "محدود",
          unavailable: "غير متوفر",
          filter: "تصفية",
          sort: "الترتيب",
          newest: "الأحدث",
          priceAsc: "السعر: من الأقل",
          priceDesc: "السعر: من الأعلى",
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
          category: "Categorie",
          all: "Tous les statuts",
          available: "Disponible",
          limited: "Limite",
          unavailable: "Indisponible",
          filter: "Filtrer",
          sort: "Tri",
          newest: "Nouveautes",
          priceAsc: "Prix: croissant",
          priceDesc: "Prix: decroissant",
          tripCodeLabel: "Code voyage",
          tripCodePlaceholder: "Entrez le code voyage",
          openTrip: "Ouvrir les locations du voyage",
          invalidTripCode: "Invalid trip code",
          empty: "Aucun equipement ne correspond pour le moment.",
          manage: "Gerer vos articles"
        };

  const items = await getPublicRentalItems({ q, city, availability }).catch((error) => {
    logServerError("page.rentals.items", error, {
      locale,
      hasQuery: Boolean(q.trim()),
      hasCity: Boolean(city.trim()),
      availability: availability || "all"
    });
    return [];
  });
  const availableCategories = Array.from(
    new Set(items.map((item: any) => (typeof item.category === "string" ? item.category.trim() : "")).filter(Boolean))
  ).sort((left, right) => left.localeCompare(right, locale === "ar" ? "ar" : "fr"));
  const filteredItems = [...items]
    .filter((item: any) => {
      const matchesCategory = category.trim()
        ? String(item.category || "").toLowerCase().includes(category.trim().toLowerCase())
        : true;

      return matchesCategory;
    })
    .sort((left: any, right: any) => {
      if (sort === "price-asc") {
        return Number(left.price || 0) - Number(right.price || 0);
      }

      if (sort === "price-desc") {
        return Number(right.price || 0) - Number(left.price || 0);
      }

      return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
    });

  return (
    <main dir={getDirection(locale)} className="page-shell space-y-8">
      <section className="relative overflow-hidden rounded-[2.75rem] shadow-[0_24px_70px_rgba(15,61,46,0.22)]">
        <Image
          src="/images/rent-gear.jpg"
          alt={locale === "ar" ? "كراء معدات الرحلات" : "Location de materiel"}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(7,31,24,0.9),rgba(15,61,46,0.68),rgba(15,61,46,0.38))]" />
        <div className="relative grid gap-8 px-6 py-10 text-white sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-12">
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">{labels.kicker}</p>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl">
              {locale === "ar" ? "كراء معدات الرحلات" : labels.title}
            </h1>
            <p className="max-w-3xl text-sm leading-8 text-white/80 sm:text-base">{labels.body}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={withLocale("/renter/items", locale)} className="rounded-full bg-white px-5 py-3 font-semibold text-forest">
                {labels.manage}
              </Link>
              <Link href="#rental-items" className="rounded-full border border-white/20 px-5 py-3 font-semibold text-white">
                {locale === "ar" ? "تصفح المعدات" : "Explorer"}
              </Link>
            </div>
          </div>
          <div className="grid gap-3">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">{locale === "ar" ? "مرن" : "Flexible"}</p>
              <p className="mt-2 text-lg font-bold">{locale === "ar" ? "تواصل مباشر مع المؤجر" : "Contact direct avec le loueur"}</p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">{locale === "ar" ? "رحلة" : "Voyage"}</p>
              <p className="mt-2 text-lg font-bold">{locale === "ar" ? "أدخل كود الرحلة عند الحاجة" : "Code voyage si necessaire"}</p>
            </div>
          </div>
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
        <form action="/rentals" className="grid gap-3 lg:grid-cols-[1.15fr_0.8fr_0.8fr_0.8fr_0.7fr_auto]">
          <input type="hidden" name="lang" value={locale} />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder={labels.search}
            className="rounded-2xl border border-ink/10 px-4 py-3 outline-none transition focus:border-[#f97316]/40 focus:ring-4 focus:ring-[#f97316]/10"
          />
          <input
            type="text"
            name="city"
            defaultValue={city}
            placeholder={labels.city}
            className="rounded-2xl border border-ink/10 px-4 py-3 outline-none transition focus:border-[#f97316]/40 focus:ring-4 focus:ring-[#f97316]/10"
          />
          <select
            name="availability"
            defaultValue={availability}
            className="rounded-2xl border border-ink/10 px-4 py-3 outline-none transition focus:border-[#f97316]/40 focus:ring-4 focus:ring-[#f97316]/10"
          >
            <option value="">{labels.all}</option>
            <option value="available">{labels.available}</option>
            <option value="limited">{labels.limited}</option>
            <option value="unavailable">{labels.unavailable}</option>
          </select>
          <select
            name="sort"
            defaultValue={sort}
            className="rounded-2xl border border-ink/10 px-4 py-3 outline-none transition focus:border-[#f97316]/40 focus:ring-4 focus:ring-[#f97316]/10"
          >
            <option value="newest">{labels.newest}</option>
            <option value="price-asc">{labels.priceAsc}</option>
            <option value="price-desc">{labels.priceDesc}</option>
          </select>
          <select
            name="category"
            defaultValue={category}
            className="rounded-2xl border border-ink/10 px-4 py-3 outline-none transition focus:border-[#f97316]/40 focus:ring-4 focus:ring-[#f97316]/10"
          >
            <option value="">{labels.category}</option>
            {availableCategories.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <button className="rounded-2xl bg-[#f97316] px-5 py-3 font-semibold text-white transition hover:bg-[#ea580c]">
            {labels.filter}
          </button>
        </form>
      </section>

      <section id="rental-items" className="space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink/60">{formatLocaleNumber(filteredItems.length, locale)} items</p>
        </div>
        {filteredItems.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item: any) => (
              <RentalItemCard key={item._id} item={item} locale={locale} isSignedIn={Boolean(session?.user)} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-ink/20 bg-white p-10 text-center text-sm text-ink/60 shadow-card">
            <p className="text-lg font-bold text-ink">{labels.empty}</p>
            <p className="mt-2 text-sm text-ink/55">
              {locale === "ar" ? "جرّب تغيير الفلاتر أو أضف معدات جديدة من لوحة المالك." : "Essayez d'autres filtres ou ajoutez du materiel depuis votre espace."}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
