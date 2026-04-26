import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactSellerForm } from "@/components/contact-seller-form";
import { ListingOwnerActions } from "@/components/listing-owner-actions";
import { ListingSaveButton } from "@/components/listing-save-button";
import { ReportForm } from "@/components/report-form";
import { ReviewForm } from "@/components/review-form";
import { ReviewReplyForm } from "@/components/review-reply-form";
import { VerificationBadge } from "@/components/verification-badge";
import { getAuthSession } from "@/lib/auth";
import { buildLoginPath } from "@/lib/auth-flow";
import { getListingById, getReviewsForListing } from "@/lib/data";
import { formatLocaleDate, getDirection, resolveLocale, siteCopy } from "@/lib/i18n";
import { canUserReviewListing } from "@/lib/reviews";
import { formatPrice } from "@/lib/utils";

export default async function ListingDetailsPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { id } = await params;
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const copy = siteCopy[locale];
  const [listing, session, reviews] = await Promise.all([
    getListingById(id),
    getAuthSession(),
    getReviewsForListing(id)
  ]);

  if (!listing) {
    notFound();
  }

  const seller = listing.seller as unknown as {
    _id?: string;
    name?: string;
    email?: string;
    sellerVerificationStatus?: string;
    verified?: boolean;
  };
  const averageRating = reviews.length
    ? reviews.reduce((sum: number, review: any) => sum + Number(review.rating || 0), 0) / reviews.length
    : 0;
  const images = listing.images?.length
    ? listing.images
    : ["/images/buy-gear.jpg"];
  const sellerId = seller?._id?.toString?.() || "";
  const isSeller = session?.user?.id === sellerId;
  const whatsappDigits = typeof listing.whatsappNumber === "string" ? listing.whatsappNumber.replace(/\D/g, "") : "";
  const phoneDigits = typeof listing.phoneNumber === "string" ? listing.phoneNumber.replace(/\D/g, "") : "";
  const isRecent = listing.createdAt ? Date.now() - new Date(listing.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000 : false;
  const loginHref = buildLoginPath(`/listings/${id}`, `lang=${locale}`, locale);
  const reviewEligibility =
    session?.user?.id && !isSeller
      ? await canUserReviewListing(session.user.id, id)
      : null;
  const canSubmitReview = Boolean(reviewEligibility?.allowed);
  const reviewBlockedMessage =
    session?.user?.id && !isSeller && reviewEligibility && !reviewEligibility.allowed
      ? reviewEligibility.reason
      : "";

  return (
    <main dir={getDirection(locale)} className="page-shell grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="space-y-6">
        <div className="overflow-hidden rounded-[2.75rem] bg-white shadow-card">
          <div className="relative h-[520px]">
            <Image
              src={images[0]}
              alt={listing.title}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 60vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
            <div className="absolute left-5 top-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                {listing.category}
              </span>
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#0f3d2e] shadow-sm backdrop-blur-md">
                {listing.type === "rental" ? copy.rental : copy.sale}
              </span>
              {isRecent ? (
                <span className="rounded-full bg-[#f97316] px-3 py-1 text-xs font-bold text-white shadow-sm">
                  {locale === "ar" ? "تم النشر مؤخراً" : "Publié récemment"}
                </span>
              ) : null}
            </div>
          </div>
          {images.length > 1 ? (
            <div className="grid grid-cols-4 gap-3 bg-white p-4 sm:grid-cols-5">
              {images.slice(1, 6).map((image: string, index: number) => (
                <div key={`${image}-${index}`} className="relative h-24 overflow-hidden rounded-[1.25rem] bg-sand">
                  <Image
                    src={image}
                    alt={`${listing.title} ${index + 2}`}
                    fill
                    sizes="160px"
                    className="object-cover transition duration-500 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-clay">{listing.category}</p>
                <VerificationBadge
                  type="seller"
                  locale={locale}
                  status={seller?.sellerVerificationStatus || (seller?.verified ? "verified" : "unverified")}
                />
                {isRecent ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {locale === "ar" ? "تم النشر مؤخراً" : "Publié récemment"}
                  </span>
                ) : null}
              </div>
              <h1 className="text-4xl font-black text-ink sm:text-5xl">{listing.title}</h1>
              <p className="text-sm text-ink/60">{listing.location}</p>
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
                <span className="rounded-full bg-sand px-3 py-1">
                  {copy.type}: {listing.type === "rental" ? copy.rental : copy.sale}
                </span>
                <span className="rounded-full bg-sand px-3 py-1">
                  {copy.status}: {listing.status || copy.active}
                </span>
                <span className="rounded-full bg-sand px-3 py-1">
                  {copy.rating}: {averageRating ? averageRating.toFixed(1) : copy.noReviews}
                </span>
              </div>
            </div>
            <div className="rounded-[1.75rem] bg-[#fff7ed] px-5 py-4 text-3xl font-black text-[#f97316] shadow-sm">
              {formatPrice(listing.price, locale)}
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.4rem] border border-ink/10 bg-sand/40 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/45">{locale === "ar" ? "البائع" : "Vendeur"}</p>
              <p className="mt-2 font-semibold text-ink">{seller?.name}</p>
            </div>
            <div className="rounded-[1.4rem] border border-ink/10 bg-sand/40 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/45">{locale === "ar" ? "التقييم" : "Avis"}</p>
              <p className="mt-2 font-semibold text-ink">{averageRating ? `${averageRating.toFixed(1)} / 5` : copy.noReviewsYet}</p>
            </div>
            <div className="rounded-[1.4rem] border border-ink/10 bg-sand/40 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/45">{locale === "ar" ? "استجابة" : "Reponse"}</p>
              <p className="mt-2 font-semibold text-ink">{locale === "ar" ? "سريعة" : "Rapide"}</p>
            </div>
          </div>

          <p className="mt-8 whitespace-pre-line text-base leading-8 text-ink/75">{listing.description}</p>

          <div className="mt-8 rounded-[1.75rem] bg-sand/35 p-5">
            <h2 className="text-lg font-bold text-ink">{locale === "ar" ? "المواصفات" : "Specifications"}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-[1.25rem] bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/45">{locale === "ar" ? "الفئة" : "Categorie"}</p>
                <p className="mt-2 font-semibold text-ink">{listing.category}</p>
              </div>
              <div className="rounded-[1.25rem] bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/45">{copy.location}</p>
                <p className="mt-2 font-semibold text-ink">{listing.location}</p>
              </div>
              <div className="rounded-[1.25rem] bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/45">{copy.status}</p>
                <p className="mt-2 font-semibold text-ink">{listing.status || copy.active}</p>
              </div>
              <div className="rounded-[1.25rem] bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/45">{locale === "ar" ? "السعر" : "Prix"}</p>
                <p className="mt-2 font-semibold text-ink">{formatPrice(listing.price, locale)}</p>
              </div>
            </div>
          </div>

          {listing.type === "rental" && (listing.startDate || listing.endDate || listing.deposit) ? (
            <div className="mt-6 rounded-[1.5rem] bg-sand p-5 text-sm text-ink/70">
              {listing.startDate ? <p>{copy.startDate}: {formatLocaleDate(listing.startDate, locale)}</p> : null}
              {listing.endDate ? <p>{copy.endDate}: {formatLocaleDate(listing.endDate, locale)}</p> : null}
              {listing.deposit ? <p>{copy.deposit}: {listing.deposit}</p> : null}
            </div>
          ) : null}
        </div>

        <section className="space-y-4 rounded-[2rem] bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-ink">{copy.reviews}</h2>
            <span className="text-sm text-ink/60">
              {averageRating ? `${averageRating.toFixed(1)} / 5` : copy.noReviewsYet}
            </span>
          </div>
          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((review: any) => (
                <div key={review._id} className="rounded-[1.5rem] border border-ink/10 p-4">
                  <p className="font-semibold text-ink">
                    {review.author?.name || copy.marketplaceUser} • {"★".repeat(Number(review.rating || 0))}{"☆".repeat(Math.max(5 - Number(review.rating || 0), 0))}
                  </p>
                  <p className="mt-2 text-sm text-ink/70">{review.comment}</p>
                  {Array.isArray(review.images) && review.images.length > 0 ? (
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {review.images.map((image: string) => (
                        <div key={image} className="relative h-24 overflow-hidden rounded-[1rem] bg-sand">
                          <Image src={image} alt="Review image" fill sizes="160px" className="object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : review.image ? (
                    <div className="relative mt-3 h-24 overflow-hidden rounded-[1rem] bg-sand">
                      <Image src={review.image} alt="Review image" fill sizes="160px" className="object-cover" />
                    </div>
                  ) : null}
                  {review.providerReply ? (
                    <div className="mt-3 rounded-[1rem] bg-sand/35 p-4 text-sm text-ink/70">
                      <p className="font-semibold text-ink">{locale === "ar" ? "رد المزود" : "Reponse du fournisseur"}</p>
                      <p className="mt-2">{review.providerReply}</p>
                    </div>
                  ) : null}
                  {isSeller ? <ReviewReplyForm reviewId={review._id} initialReply={review.providerReply || ""} /> : null}
                  {session?.user ? (
                    <div className="mt-4">
                      <ReportForm targetType="review" targetId={review._id} title={copy.reportReview} compact locale={locale} />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink/60">{copy.noReviewsYet}</p>
          )}
        </section>
      </section>
      <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.25em] text-ink/45">{copy.seller}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold text-ink">{seller?.name}</h2>
            <VerificationBadge
              type="seller"
              locale={locale}
              status={seller?.sellerVerificationStatus || (seller?.verified ? "verified" : "unverified")}
            />
          </div>
          <p className="mt-2 text-sm text-ink/60">{listing.phoneNumber}</p>
          <p className="mt-2 text-sm text-ink/60">{listing.whatsappNumber}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.25rem] bg-sand/50 p-4 text-sm text-ink/70">
              <p className="font-semibold text-ink">{locale === "ar" ? "موثوق" : "Utilisateur verifie"}</p>
            </div>
            <div className="rounded-[1.25rem] bg-sand/50 p-4 text-sm text-ink/70">
              <p className="font-semibold text-ink">{locale === "ar" ? "تحديث حديث" : "Publie recemment"}</p>
            </div>
            <div className="rounded-[1.25rem] bg-sand/50 p-4 text-sm text-ink/70">
              <p className="font-semibold text-ink">{locale === "ar" ? "استجابة سريعة" : "Reponse rapide"}</p>
            </div>
          </div>
          {session?.user && !isSeller ? (
            <div className="mt-4 flex flex-wrap gap-3">
              <ReportForm targetType="listing" targetId={listing._id} title={copy.reportListing} compact locale={locale} />
              {sellerId ? <ReportForm targetType="user" targetId={sellerId} title={copy.reportSeller} compact locale={locale} /> : null}
            </div>
          ) : null}
        </div>
        {session?.user ? (
          isSeller ? (
            <ListingOwnerActions listingId={listing._id} status={listing.status || "active"} />
          ) : (
            <div className="space-y-4 rounded-[2rem] bg-white p-6 shadow-card">
              <div className="grid gap-3 sm:grid-cols-2">
                {whatsappDigits ? (
                  <a
                    href={`https://wa.me/${whatsappDigits}`}
                    target="_blank"
                    rel="noreferrer"
                    data-analytics-event="whatsapp_click"
                    className="inline-flex items-center justify-center rounded-2xl bg-forest px-4 py-3 font-semibold text-white shadow-card transition hover:-translate-y-0.5"
                  >
                    {locale === "ar" ? "واتساب" : "WhatsApp"}
                  </a>
                ) : (
                  <span className="inline-flex items-center justify-center rounded-2xl bg-forest px-4 py-3 font-semibold text-white opacity-60">
                    {locale === "ar" ? "واتساب" : "WhatsApp"}
                  </span>
                )}
                {phoneDigits ? (
                  <Link
                    href={`tel:${phoneDigits}`}
                    className="inline-flex items-center justify-center rounded-2xl border border-ink/10 bg-white px-4 py-3 font-semibold text-ink shadow-card transition hover:-translate-y-0.5 hover:bg-sand/40"
                  >
                    {locale === "ar" ? "اتصال" : "Appeler"}
                  </Link>
                ) : (
                  <span className="inline-flex items-center justify-center rounded-2xl border border-ink/10 bg-white px-4 py-3 font-semibold text-ink opacity-60">
                    {locale === "ar" ? "اتصال" : "Appeler"}
                  </span>
                )}
                <ListingSaveButton listingId={listing._id} locale={locale} />
              </div>
              <ContactSellerForm
                listingId={listing._id}
                sellerId={sellerId}
                phoneNumber={listing.phoneNumber}
                whatsappNumber={listing.whatsappNumber}
                locale={locale}
              />
            </div>
          )
        ) : (
          <div className="rounded-[2rem] border border-ink/10 bg-white p-6 text-sm text-ink/65 shadow-card">
            <p>{copy.logInToContact}</p>
            <Link href={loginHref} className="mt-4 inline-flex rounded-full bg-forest px-4 py-2 font-semibold text-white">
              {copy.login}
            </Link>
          </div>
        )}
        {session?.user && !isSeller ? <ReviewForm listingId={listing._id} canSubmit={canSubmitReview} blockedMessage={reviewBlockedMessage} /> : null}
      </aside>
    </main>
  );
}
