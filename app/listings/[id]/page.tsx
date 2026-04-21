import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ContactSellerForm } from "@/components/contact-seller-form";
import { ListingOwnerActions } from "@/components/listing-owner-actions";
import { ReviewForm } from "@/components/review-form";
import { getAuthSession } from "@/lib/auth";
import { getListingById, getReviewsForListing } from "@/lib/data";
import { resolveLocale } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

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
  };
  const averageRating = reviews.length
    ? reviews.reduce((sum: number, review: any) => sum + Number(review.rating || 0), 0) / reviews.length
    : 0;
  const images = listing.images?.length
    ? listing.images
    : ["https://images.unsplash.com/photo-1516321318423-f06f85e504b3"];
  const sellerId = seller?._id?.toString?.() || "";
  const isSeller = session?.user?.id === sellerId;

  return (
    <main className="page-shell grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {images.slice(0, 2).map((image: string, index: number) => (
            <div key={`${image}-${index}`} className="relative h-72 overflow-hidden rounded-[2rem] bg-white shadow-card">
              <img src={image} alt={listing.title} className="h-full w-full object-cover" />
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
              <p className="mt-3 text-sm text-ink/60">Type: {listing.type}</p>
              <p className="mt-3 text-sm text-ink/60">
                Status: {listing.status || "active"} | Rating: {averageRating ? averageRating.toFixed(1) : "No reviews"}
              </p>
            </div>
            <div className="rounded-full bg-sand px-5 py-3 text-2xl font-black text-clay">
              {formatPrice(listing.price)}
            </div>
          </div>
          <p className="mt-6 whitespace-pre-line text-base leading-7 text-ink/75">
            {listing.description}
          </p>
          {listing.type === "rental" && (listing.startDate || listing.endDate || listing.deposit) ? (
            <div className="mt-6 rounded-[1.5rem] bg-sand p-5 text-sm text-ink/70">
              {listing.startDate ? <p>Rental start: {new Date(listing.startDate).toLocaleDateString()}</p> : null}
              {listing.endDate ? <p>Rental end: {new Date(listing.endDate).toLocaleDateString()}</p> : null}
              {listing.deposit ? <p>Deposit: {listing.deposit}</p> : null}
            </div>
          ) : null}
        </div>
        <section className="space-y-4 rounded-[2rem] bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-ink">Reviews</h2>
            <span className="text-sm text-ink/60">
              {averageRating ? `${averageRating.toFixed(1)} / 5` : "No reviews yet"}
            </span>
          </div>
          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((review: any) => (
                <div key={review._id} className="rounded-[1.5rem] border border-ink/10 p-4">
                  <p className="font-semibold text-ink">
                    {review.author?.name || "User"} • {review.rating}/5
                  </p>
                  <p className="mt-2 text-sm text-ink/70">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink/60">No reviews yet.</p>
          )}
        </section>
      </section>
      <aside className="space-y-6">
        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.25em] text-ink/45">Seller</p>
          <h2 className="mt-3 text-2xl font-bold text-ink">{seller?.name}</h2>
          <p className="mt-2 text-sm text-ink/60">{listing.phoneNumber}</p>
          <p className="mt-2 text-sm text-ink/60">{listing.whatsappNumber}</p>
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
            <p>Log in to contact the seller and start a chat.</p>
            <Link href="/login" className="mt-4 inline-flex rounded-full bg-forest px-4 py-2 font-semibold text-white">
              Log in
            </Link>
          </div>
        )}
        {session?.user ? <ReviewForm listingId={listing._id} /> : null}
      </aside>
    </main>
  );
}
