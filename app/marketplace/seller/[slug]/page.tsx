import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingCard } from "@/components/listing-card";
import { SellerLeadForm } from "@/components/seller-lead-form";
import { VerificationBadge } from "@/components/verification-badge";
import { getAuthSession } from "@/lib/auth";
import { getPublicSellerStoreData } from "@/lib/seller";
import { getDirection, resolveLocale, withLocale } from "@/lib/i18n";

export default async function SellerStorePage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const isArabic = locale === "ar";
  const [store, session] = await Promise.all([getPublicSellerStoreData(slug), getAuthSession()]);

  if (!store) {
    notFound();
  }

  const seller = store.seller as any;
  const listings = store.listings as any[];
  const profile = seller.sellerProfile || {};
  const phone = String(profile.phone || "").trim();
  const whatsapp = String(profile.whatsapp || phone || "").trim();
  const phoneDigits = phone.replace(/\D/g, "");
  const whatsappDigits = whatsapp.replace(/\D/g, "");

  return (
    <main dir={getDirection(locale)} className="page-shell space-y-8">
      <section className="overflow-hidden rounded-[2.75rem] bg-white shadow-card">
        <div className="grid gap-6 p-6 lg:grid-cols-[180px_1fr] lg:p-8">
          <div className="relative h-36 w-36 overflow-hidden rounded-[2rem] bg-sand shadow-sm">
            <Image
              src={seller.avatar || "/images/hero-main.jpg"}
              alt={seller.name || "Seller"}
              fill
              sizes="144px"
              className="object-cover"
            />
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-black text-ink">{seller.name || (isArabic ? "متجر البائع" : "Seller store")}</h1>
              <VerificationBadge
                type="seller"
                locale={locale}
                status={seller.sellerVerificationStatus || (seller.verified ? "verified" : "unverified")}
              />
            </div>
            {profile.city ? <p className="text-sm text-ink/60">{profile.city}</p> : null}
            {profile.description ? <p className="max-w-3xl text-sm leading-7 text-ink/70">{profile.description}</p> : null}
            <div className="flex flex-wrap gap-3">
              {profile.instagram ? (
                <a
                  href={String(profile.instagram)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink"
                >
                  Instagram
                </a>
              ) : null}
              {profile.facebook ? (
                <a
                  href={String(profile.facebook)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink"
                >
                  Facebook
                </a>
              ) : null}
              {whatsappDigits ? (
                <a
                  href={`https://wa.me/${whatsappDigits}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-[#0f3d2e] px-4 py-2 text-sm font-semibold text-white"
                >
                  {isArabic ? "واتساب" : "WhatsApp"}
                </a>
              ) : null}
              {phoneDigits ? (
                <Link
                  href={`tel:${phoneDigits}`}
                  className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink"
                >
                  {isArabic ? "اتصال" : "Call"}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <SellerLeadForm
        sellerId={String(seller._id)}
        source="seller_store"
        title={isArabic ? "التواصل مع هذا المتجر" : "Contact this store"}
        isSignedIn={Boolean(session?.user)}
      />

      <section className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-clay">{isArabic ? "المنتجات" : "Products"}</p>
            <h2 className="text-3xl font-black text-ink">{isArabic ? "إعلانات هذا المتجر" : "Listings from this store"}</h2>
          </div>
          <p className="text-sm text-ink/60">{listings.length} {isArabic ? "إعلان" : "listings"}</p>
        </div>

        {listings.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing: any) => (
              <ListingCard key={listing._id} listing={listing} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-ink/20 bg-white p-10 text-center text-sm text-ink/60 shadow-card">
            {isArabic ? "لا توجد إعلانات نشطة في هذا المتجر حالياً." : "No active listings are available in this store right now."}
          </div>
        )}
      </section>
    </main>
  );
}
