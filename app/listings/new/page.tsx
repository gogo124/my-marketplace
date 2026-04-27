import type { Metadata } from "next";
import Link from "next/link";
import { ListingCard } from "@/components/listing-card";
import { NewListingForm } from "@/components/new-listing-form";
import { getAuthSession } from "@/lib/auth";
import { getListingsPage } from "@/lib/data";
import { getDirection, resolveLocale, siteCopy, withLocale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import { logServerError } from "@/lib/server-log";

export async function generateMetadata({
  searchParams
}: {
  searchParams: Promise<{ lang?: string; category?: string; location?: string }>;
}): Promise<Metadata> {
  const { lang, category = "", location = "" } = await searchParams;
  const locale = resolveLocale(lang);

  return buildPageMetadata({
    title:
      locale === "ar"
        ? `سوق المعدات والمنتجات${category ? ` - ${category}` : ""}${location ? ` - ${location}` : ""}`
        : `Marketplace equipements et produits${category ? ` - ${category}` : ""}${location ? ` - ${location}` : ""}`,
    description:
      locale === "ar"
        ? "تصفح منتجات ومعدات السفر المعروضة للبيع، قارن الأسعار والبائعين، واتخذ القرار بسرعة."
        : "Parcourez les equipements et produits de voyage en vente, comparez prix et vendeurs, puis passez a l'action rapidement.",
    path: "/listings/new",
    image: "/images/buy-gear.jpg"
  });
}

type ListingsSearchParams = {
  lang?: string;
  page?: string;
  q?: string;
  category?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
};

function parseNumber(value?: string) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

export default async function NewListingPage({
  searchParams
}: {
  searchParams: Promise<ListingsSearchParams>;
}) {
  const {
    lang,
    page = "1",
    q = "",
    category = "",
    location = "",
    minPrice = "",
    maxPrice = "",
    sort = "newest"
  } = await searchParams;
  const locale = resolveLocale(lang);
  const copy = siteCopy[locale];
  const currentPage = Math.max(1, Number(page) || 1);
  const priceMin = parseNumber(minPrice);
  const priceMax = parseNumber(maxPrice);
  const session = await getAuthSession().catch((error) => {
    logServerError("page.new-listing.auth", error);
    return null;
  });
  const { listings: saleListings, pagination } = await getListingsPage({
    type: "sale",
    page: currentPage,
    pageSize: 24,
    q: q || undefined,
    category: category || undefined,
    location: location || undefined
  }).catch((error) => {
    logServerError("page.new-listing.sale-listings", error, { page: currentPage });
    return {
      listings: [],
      pagination: {
        page: currentPage,
        pageSize: 24,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      }
    };
  });
  const loginHref = withLocale("/login", locale);
  const availableCategories = Array.from(
    new Set(
      saleListings
        .map((listing: any) => (typeof listing.category === "string" ? listing.category.trim() : ""))
        .filter(Boolean)
    )
  ).sort((left, right) => left.localeCompare(right, locale === "ar" ? "ar" : "fr"));
  const filteredListings = [...saleListings]
    .filter((listing: any) => {
      const numericPrice = Number(listing.price || 0);

      if (priceMin !== null && numericPrice < priceMin) {
        return false;
      }

      if (priceMax !== null && numericPrice > priceMax) {
        return false;
      }

      return true;
    })
    .sort((left: any, right: any) => {
      if (sort === "price-asc") {
        return Number(left.price || 0) - Number(right.price || 0);
      }

      if (sort === "price-desc") {
        return Number(right.price || 0) - Number(left.price || 0);
      }

      if (sort === "popular") {
        const leftVerified = Boolean(left.seller?.sellerVerificationStatus === "verified" || left.seller?.verified);
        const rightVerified = Boolean(right.seller?.sellerVerificationStatus === "verified" || right.seller?.verified);

        if (leftVerified !== rightVerified) {
          return Number(rightVerified) - Number(leftVerified);
        }
      }

      return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
    });
  const baseListingsHref = withLocale("/listings/new", locale);

  return (
    <main dir={getDirection(locale)} className="page-shell space-y-8">
      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="image-surface relative overflow-hidden rounded-[2.75rem] px-8 py-10 text-white shadow-card">
          <div className="absolute left-0 top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="space-y-5">
            <p className="section-kicker">{copy.sell}</p>
            <h1 className="text-5xl font-black leading-[1.08]">{copy.listingCreateSaleTitle}</h1>
            <p className="max-w-lg leading-8 text-white/75">{copy.listingCreateSaleBody}</p>
            <div className="flex flex-wrap gap-3 text-xs font-semibold text-white/90">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">
                {locale === "ar" ? "بائعون موثقون" : "Vendeurs verifies"}
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">
                {locale === "ar" ? "مقارنة أسهل للأسعار" : "Comparaison de prix plus claire"}
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">
                {locale === "ar" ? "تواصل مباشر" : "Contact direct"}
              </span>
            </div>
            {!session?.user ? (
              <div className="rounded-[1.8rem] border border-white/15 bg-white/10 p-5">
                <p className="text-sm leading-7 text-white/80">
                  {locale === "ar"
                    ? "سجل الدخول أولاً لإضافة إعلان بيع جديد، ويمكنك في الأسفل مشاهدة كل المنتجات النشطة."
                    : "Connectez-vous d'abord pour publier une annonce, puis consultez tous les produits actifs ci-dessous."}
                </p>
                <Link href={loginHref} className="mt-4 inline-flex rounded-full bg-white px-5 py-3 font-semibold text-forest">
                  {locale === "ar" ? "تسجيل الدخول" : "Connexion"}
                </Link>
              </div>
            ) : null}
          </div>
        </section>
        {session?.user ? (
          <NewListingForm />
        ) : (
          <section className="rounded-[2.4rem] border border-ink/10 bg-white p-8 shadow-card">
            <h2 className="text-3xl font-black text-ink">{locale === "ar" ? "منتجات للبيع" : "Produits en vente"}</h2>
            <p className="mt-3 text-sm leading-7 text-ink/65">
              {locale === "ar"
                ? "يمكنك تصفح جميع المنتجات النشطة هنا، ثم تسجيل الدخول عندما تكون جاهزاً لإضافة منتجك."
                : "Vous pouvez parcourir ici tous les produits actifs, puis vous connecter quand vous serez pret a publier le votre."}
            </p>
          </section>
        )}
      </section>

      <section id="sale-products" className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-clay">{copy.marketplaceSearch}</p>
            <h2 className="text-3xl font-black text-ink">
              {locale === "ar" ? "جميع المنتجات المعروضة للبيع" : "Tous les produits en vente"}
            </h2>
            <p className="text-sm text-ink/60">
              {locale === "ar"
                ? `عرض ${filteredListings.length} من أصل ${pagination.total} إعلان نشط.`
                : `${filteredListings.length} annonces affichees sur ${pagination.total} actives.`}
            </p>
          </div>
          <Link href={withLocale("/", locale)} className="hidden rounded-full border border-ink/10 px-4 py-2 font-semibold text-ink sm:inline-flex">
            {locale === "ar" ? "العودة إلى الرئيسية" : "Retour accueil"}
          </Link>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.75rem] bg-white p-5 shadow-card">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/45">{locale === "ar" ? "الهدف" : "But"}</p>
            <p className="mt-2 text-lg font-black text-ink">{locale === "ar" ? "اختيار أسرع" : "Choix plus rapide"}</p>
            <p className="mt-2 text-sm leading-7 text-ink/60">
              {locale === "ar"
                ? "البطاقات توضّح السعر والحالة والثقة من أول نظرة."
                : "Les cartes montrent mieux le prix, l'etat et la confiance au premier regard."}
            </p>
          </div>
          <div className="rounded-[1.75rem] bg-white p-5 shadow-card">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/45">{locale === "ar" ? "الثقة" : "Confiance"}</p>
            <p className="mt-2 text-lg font-black text-ink">{locale === "ar" ? "إشارات أوضح" : "Signaux plus clairs"}</p>
            <p className="mt-2 text-sm leading-7 text-ink/60">
              {locale === "ar"
                ? "نوضح البائع الموثق والمنتجات الحديثة لخفض التردد."
                : "Les vendeurs verifies et les annonces recentes sont plus visibles pour reduire l'hesitation."}
            </p>
          </div>
          <div className="rounded-[1.75rem] bg-white p-5 shadow-card">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/45">{locale === "ar" ? "الإجراء" : "Action"}</p>
            <p className="mt-2 text-lg font-black text-ink">{locale === "ar" ? "تفاصيل ثم تواصل" : "Detail puis contact"}</p>
            <p className="mt-2 text-sm leading-7 text-ink/60">
              {locale === "ar"
                ? "كل منتج يقود بوضوح إلى صفحة التفاصيل ثم التواصل مع البائع."
                : "Chaque produit mene clairement a la page detail puis au contact vendeur."}
            </p>
          </div>
        </section>

        <form
          action="/listings/new"
          method="get"
          className="sticky top-20 z-20 rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-[0_24px_60px_rgba(15,61,46,0.08)] backdrop-blur-xl sm:p-5"
        >
          <input type="hidden" name="lang" value={locale} />
          <input type="hidden" name="page" value="1" />
          <div className="grid gap-3 lg:grid-cols-[1.2fr_0.9fr_0.9fr_0.6fr_0.6fr_0.7fr_auto]">
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
              {locale === "ar" ? "بحث" : "Recherche"}
              <input
                name="q"
                defaultValue={q}
                placeholder={locale === "ar" ? "ابحث عن منتج، اسم، أو وصف" : "Rechercher un produit, un titre, une description"}
                className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-[#f97316]/40 focus:ring-4 focus:ring-[#f97316]/10"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
              {locale === "ar" ? "الفئة" : "Categorie"}
              <select
                name="category"
                defaultValue={category}
                className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-[#f97316]/40 focus:ring-4 focus:ring-[#f97316]/10"
              >
                <option value="">{locale === "ar" ? "كل الفئات" : "Toutes les categories"}</option>
                {availableCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
              {locale === "ar" ? "المدينة" : "Ville"}
              <input
                name="location"
                defaultValue={location}
                placeholder={locale === "ar" ? "الرباط، مراكش..." : "Rabat, Marrakech..."}
                className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-[#f97316]/40 focus:ring-4 focus:ring-[#f97316]/10"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
              {locale === "ar" ? "أدنى سعر" : "Prix min"}
              <input
                name="minPrice"
                type="number"
                min="0"
                defaultValue={minPrice}
                placeholder="0"
                className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-[#f97316]/40 focus:ring-4 focus:ring-[#f97316]/10"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
              {locale === "ar" ? "أقصى سعر" : "Prix max"}
              <input
                name="maxPrice"
                type="number"
                min="0"
                defaultValue={maxPrice}
                placeholder="0"
                className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-[#f97316]/40 focus:ring-4 focus:ring-[#f97316]/10"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
              {locale === "ar" ? "الترتيب" : "Tri"}
              <select
                name="sort"
                defaultValue={sort}
                className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-[#f97316]/40 focus:ring-4 focus:ring-[#f97316]/10"
              >
                <option value="newest">{locale === "ar" ? "الأحدث" : "Nouveautes"}</option>
                <option value="price-asc">{locale === "ar" ? "السعر: من الأقل" : "Prix: croissant"}</option>
                <option value="price-desc">{locale === "ar" ? "السعر: من الأعلى" : "Prix: decroissant"}</option>
                <option value="popular">{locale === "ar" ? "الأكثر تميزاً" : "Populaire"}</option>
              </select>
            </label>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-forest px-5 py-3 font-semibold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-[#0b3225]"
              >
                {locale === "ar" ? "تصفية" : "Filtrer"}
              </button>
              <Link
                href={baseListingsHref}
                className="inline-flex w-full items-center justify-center rounded-2xl border border-ink/10 bg-white px-5 py-3 font-semibold text-ink shadow-card transition hover:bg-sand/40"
              >
                {locale === "ar" ? "مسح" : "Effacer"}
              </Link>
            </div>
          </div>
        </form>

        {filteredListings.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredListings.map((listing: any) => (
                <ListingCard key={listing._id} listing={listing} locale={locale} />
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] bg-white px-4 py-3 text-sm text-ink/70 shadow-card">
              <span>
                {locale === "ar"
                  ? `الصفحة ${pagination.page} من ${pagination.totalPages}`
                  : `Page ${pagination.page} sur ${pagination.totalPages}`}
              </span>
              <div className="flex gap-2">
                {pagination.hasPreviousPage ? (
                  <Link
                    href={withLocale(`/listings/new?page=${pagination.page - 1}#sale-products`, locale)}
                    className="rounded-full border border-ink/10 px-4 py-2 font-semibold text-ink"
                  >
                    {locale === "ar" ? "السابق" : "Precedent"}
                  </Link>
                ) : null}
                {pagination.hasNextPage ? (
                  <Link
                    href={withLocale(`/listings/new?page=${pagination.page + 1}#sale-products`, locale)}
                    className="rounded-full bg-forest px-4 py-2 font-semibold text-white"
                  >
                    {locale === "ar" ? "التالي" : "Suivant"}
                  </Link>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-[2rem] bg-white p-6 text-sm text-ink/60 shadow-card">
            {locale === "ar"
              ? "لا توجد حالياً منتجات بيع نشطة."
              : "Aucun produit actif en vente pour le moment."}
          </div>
        )}
      </section>
    </main>
  );
}
