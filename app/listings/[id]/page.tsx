import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ContactSellerForm } from "@/components/contact-seller-form";
import { ListingOwnerActions } from "@/components/listing-owner-actions";
import { ReportForm } from "@/components/report-form";
import { ReviewForm } from "@/components/review-form";
import { ReviewReplyForm } from "@/components/review-reply-form";
import { VerificationBadge } from "@/components/verification-badge";
import { getAuthSession } from "@/lib/auth";
import { buildLoginPath } from "@/lib/auth-flow";
import { getListingById, getReviewsForListing } from "@/lib/data";
import { formatLocaleDate, getDirection, resolveLocale, siteCopy, withLocale } from "@/lib/i18n";
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
    : ["https://images.unsplash.com/photo-1516321318423-f06f85e504b3"];
  const sellerId = seller?._id?.toString?.() || "";
  const isSeller = session?.user?.id === sellerId;
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
    <main dir={getDirection(locale)} className="page-shell grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {images.map((image: string, index: number) => (
            <div key={`${image}-${index}`} className="relative h-72 overflow-hidden rounded-[2rem] bg-white shadow-card">
              <Image
                src={image}
                alt={listing.title}
                fill
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-clay">
                {listing.category}
              </p>
              <h1 className="mt-2 text-4xl font-black text-ink">{listing.title}</h1>
              <p className="mt-3 text-sm text-ink/60">{listing.location}</p>
              <p className="mt-3 text-sm text-ink/60">{copy.type}: {listing.type === "rental" ? copy.rental : copy.sale}</p>
              <p className="mt-3 text-sm text-ink/60">
                {copy.status}: {listing.status || copy.active} | {copy.rating}: {averageRating ? averageRating.toFixed(1) : copy.noReviews}
              </p>
            </div>
            <div className="rounded-full bg-sand px-5 py-3 text-2xl font-black text-clay">
              {formatPrice(listing.price, locale)}
            </div>
          </div>
          <p className="mt-6 whitespace-pre-line text-base leading-7 text-ink/75">
            {listing.description}
          </p>
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
      <aside className="space-y-6">
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
            <ContactSellerForm
              listingId={listing._id}
              sellerId={sellerId}
              phoneNumber={listing.phoneNumber}
              whatsappNumber={listing.whatsappNumber}
              locale={locale}
            />
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
