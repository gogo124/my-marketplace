import Link from "next/link";
import { ListingCard } from "@/components/listing-card";
import { NewListingForm } from "@/components/new-listing-form";
import { getAuthSession } from "@/lib/auth";
import { getListingsPage } from "@/lib/data";
import { getDirection, resolveLocale, siteCopy, withLocale } from "@/lib/i18n";
import { logServerError } from "@/lib/server-log";

export default async function NewListingPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string; page?: string }>;
}) {
  const { lang, page = "1" } = await searchParams;
  const locale = resolveLocale(lang);
  const copy = siteCopy[locale];
  const currentPage = Math.max(1, Number(page) || 1);
  const session = await getAuthSession().catch((error) => {
    logServerError("page.new-listing.auth", error);
    return null;
  });
  const { listings: saleListings, pagination } = await getListingsPage({
    type: "sale",
    page: currentPage,
    pageSize: 12
  }).catch((error) => {
    logServerError("page.new-listing.sale-listings", error, { page: currentPage });
    return {
      listings: [],
      pagination: {
        page: currentPage,
        pageSize: 12,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      }
    };
  });
  const loginHref = withLocale("/login", locale);

  return (
    <main dir={getDirection(locale)} className="page-shell space-y-8">
      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative overflow-hidden rounded-[2.75rem] bg-forest px-8 py-10 text-white shadow-card">
          <div className="absolute left-0 top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="space-y-5">
            <p className="section-kicker">{copy.sell}</p>
            <h1 className="text-5xl font-black leading-[1.08]">{copy.listingCreateSaleTitle}</h1>
            <p className="max-w-lg leading-8 text-white/75">{copy.listingCreateSaleBody}</p>
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-clay">{copy.marketplaceSearch}</p>
            <h2 className="text-3xl font-black text-ink">
              {locale === "ar" ? "جميع المنتجات المعروضة للبيع" : "Tous les produits en vente"}
            </h2>
            <p className="text-sm text-ink/60">
              {locale === "ar"
                ? `عرض ${saleListings.length} من أصل ${pagination.total} إعلان نشط.`
                : `${saleListings.length} annonces affichees sur ${pagination.total} actives.`}
            </p>
          </div>
          <Link href={withLocale("/", locale)} className="hidden rounded-full border border-ink/10 px-4 py-2 font-semibold text-ink sm:inline-flex">
            {locale === "ar" ? "العودة إلى الرئيسية" : "Retour accueil"}
          </Link>
        </div>
        {saleListings.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {saleListings.map((listing: any) => (
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
