import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ListingCard } from "@/components/listing-card";
import { VerificationBadge } from "@/components/verification-badge";
import { getAuthSession } from "@/lib/auth";
import { getListingsPage } from "@/lib/data";
import { getDirection, resolveLocale, withLocale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import { getPublicSellerDirectory, getSellerAccessSnapshot } from "@/lib/seller";
import { logServerError } from "@/lib/server-log";

type MarketplaceSearchParams = {
  lang?: string;
  page?: string;
  q?: string;
  category?: string;
  location?: string;
};

export async function generateMetadata({
  searchParams
}: {
  searchParams: Promise<MarketplaceSearchParams>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);

  return buildPageMetadata({
    title: locale === "ar" ? "Marketplace | منتجات ومتاجر السفر" : "Marketplace | Produits et boutiques voyage",
    description:
      locale === "ar"
        ? "تصفح منتجات السفر والتخييم من بائعين نشطين، واكتشف المتاجر الصغيرة داخل Moroccan Trip."
        : "Parcourez les produits voyage et camping de vendeurs actifs et decouvrez leurs mini-boutiques sur Moroccan Trip.",
    path: "/marketplace",
    image: "/images/buy-gear.jpg"
  });
}

export default async function MarketplacePage({
  searchParams
}: {
  searchParams: Promise<MarketplaceSearchParams>;
}) {
  const { lang, page = "1", q = "", category = "", location = "" } = await searchParams;
  const locale = resolveLocale(lang);
  const isArabic = locale === "ar";
  const currentPage = Math.max(1, Number(page) || 1);
  const session = await getAuthSession().catch(() => null);

  const [listingsPage, sellers] = await Promise.all([
    getListingsPage({
      type: "sale",
      page: currentPage,
      pageSize: 24,
      q: q || undefined,
      category: category || undefined,
      location: location || undefined
    }).catch((error) => {
      logServerError("page.marketplace.listings", error, { page: currentPage });
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
    }),
    getPublicSellerDirectory(8).catch((error) => {
      logServerError("page.marketplace.sellers", error);
      return [];
    })
  ]);

  const sellerAccess = getSellerAccessSnapshot(session?.user as any);
  const canPublish = sellerAccess.canPublish;

  return (
    <main dir={getDirection(locale)} className="page-shell space-y-8">
      <section className="relative overflow-hidden rounded-[2.75rem] px-6 py-10 text-white shadow-[0_24px_80px_rgba(15,61,46,0.18)] sm:px-8 sm:py-14">
        <div className="absolute inset-0">
          <Image src="/images/buy-gear.jpg" alt="Marketplace" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(7,24,18,0.9),rgba(15,61,46,0.72)_52%,rgba(249,115,22,0.25))]" />
        </div>
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
              Marketplace
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
              {isArabic ? "منتجات ومتاجر السفر داخل Moroccan Trip" : "Produits et mini-boutiques voyage sur Moroccan Trip"}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
              {isArabic
                ? "الزوار يشوفو جميع المنتجات العلنية من البائعين النشطين، ويدخلو مباشرة للمتاجر أو للتواصل."
                : "Les visiteurs decouvrent tous les produits publics des vendeurs actifs et accedent directement aux boutiques ou au contact."}
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90">
                {listingsPage.pagination.total} {isArabic ? "منتج علني" : "produits publics"}
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90">
                {sellers.length} {isArabic ? "متجر نشط" : "boutiques actives"}
              </span>
            </div>
          </div>
          <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                {isArabic ? "الدخول الصحيح" : "Acces correct"}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/75">
                {isArabic
                  ? "التصفح مفتوح للجميع. النشر والتسيير كيبقاو فقط للبائعين الموافق عليهم من الإدارة."
                  : "La navigation est publique. La publication et la gestion restent reservees aux vendeurs approuves par l'administration."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={withLocale("/seller/dashboard", locale)} className="rounded-full bg-white px-5 py-3 text-sm font-bold text-[#0f3d2e] shadow-card">
                {canPublish ? (isArabic ? "لوحة البائع" : "Tableau vendeur") : isArabic ? "طلب تفعيل البيع" : "Demander l'acces vendeur"}
              </Link>
              <Link href={withLocale("/listings/new", locale)} className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white">
                {isArabic ? "مساحة النشر" : "Espace publication"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-black text-ink">{isArabic ? "ابحث داخل المنتجات" : "Rechercher dans le marketplace"}</h2>
            <p className="text-sm text-ink/60">
              {isArabic ? "كل النتائج هنا جاية فقط من بائعين نشطين داخل المنصة." : "Tous les resultats proviennent uniquement de vendeurs actifs sur la plateforme."}
            </p>
          </div>
          <p className="text-sm text-ink/50">
            {isArabic ? `${listingsPage.pagination.total} نتيجة` : `${listingsPage.pagination.total} resultats`}
          </p>
        </div>
        <form action="/marketplace" className="mt-5 grid gap-3 rounded-[1.75rem] border border-ink/10 bg-sand/25 p-4 lg:grid-cols-[1.3fr_0.9fr_0.9fr_auto]">
          <input type="hidden" name="lang" value={locale} />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder={isArabic ? "شنو كتقلب؟" : "Que cherchez-vous ?"}
            className="rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:ring-2 focus:ring-clay/30"
          />
          <input
            type="text"
            name="category"
            defaultValue={category}
            placeholder={isArabic ? "الفئة" : "Categorie"}
            className="rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:ring-2 focus:ring-clay/30"
          />
          <input
            type="text"
            name="location"
            defaultValue={location}
            placeholder={isArabic ? "المدينة أو المنطقة" : "Ville ou region"}
            className="rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:ring-2 focus:ring-clay/30"
          />
          <button className="rounded-2xl bg-clay px-5 py-3 font-semibold text-white transition hover:brightness-105">
            {isArabic ? "بحث" : "Rechercher"}
          </button>
        </form>
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-clay">{isArabic ? "المتاجر الصغيرة" : "Mini-boutiques"}</p>
            <h2 className="text-3xl font-black text-ink">{isArabic ? "بائعون نشطون" : "Vendeurs actifs"}</h2>
          </div>
          <Link href={withLocale("/seller/dashboard", locale)} className="rounded-full border border-ink/10 px-4 py-2 font-semibold text-ink">
            {isArabic ? "لوحة البائع" : "Tableau vendeur"}
          </Link>
        </div>

        {sellers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {sellers.map((seller: any) => {
              const profile = seller.sellerProfile || {};

              return (
                <Link
                  key={seller._id}
                  href={withLocale(`/marketplace/seller/${seller.storeSlug}`, locale)}
                  className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-[0_12px_34px_rgba(15,61,46,0.08)] transition hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(15,61,46,0.12)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-[1.25rem] bg-sand">
                      <Image src={seller.avatar || "/images/hero-main.jpg"} alt={seller.name || "Seller"} fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-lg font-black text-slate-900">{profile.businessName || seller.name}</p>
                        <VerificationBadge
                          type="seller"
                          locale={locale}
                          status={seller.sellerVerificationStatus || (seller.verified ? "verified" : "unverified")}
                        />
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{profile.city || (isArabic ? "المغرب" : "Maroc")}</p>
                    </div>
                  </div>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                    {profile.description || profile.whatTheySell || (isArabic ? "ادخل للمتجر وشوف المنتجات النشطة ديالو." : "Entrez dans la boutique pour voir ses produits actifs.")}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                      {seller.activeListingsCount} {isArabic ? "إعلان نشط" : "annonces actives"}
                    </span>
                    <span className="text-sm font-semibold text-[#0f3d2e]">{isArabic ? "فتح المتجر" : "Ouvrir"}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-ink/20 bg-white p-10 text-center text-sm text-ink/60 shadow-card">
            {isArabic ? "لا توجد متاجر نشطة حالياً." : "Aucune boutique active pour le moment."}
          </div>
        )}
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-clay">{isArabic ? "المنتجات" : "Produits"}</p>
            <h2 className="text-3xl font-black text-ink">{isArabic ? "كل المنتجات العلنية" : "Tous les produits publics"}</h2>
          </div>
        </div>

        {listingsPage.listings.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {listingsPage.listings.map((listing: any) => (
              <ListingCard key={listing._id} listing={listing} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-ink/20 bg-white p-10 text-center text-sm text-ink/60 shadow-card">
            {isArabic ? "لا توجد منتجات مطابقة حالياً." : "Aucun produit correspondant pour le moment."}
          </div>
        )}
      </section>
    </main>
  );
}
