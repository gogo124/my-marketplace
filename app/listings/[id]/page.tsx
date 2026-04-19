import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ContactSellerForm } from "@/components/contact-seller-form";
import { getAuthSession } from "@/lib/auth";
import { getListingById } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ListingDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [listing, session] = await Promise.all([getListingById(id), getAuthSession()]);

  if (!listing) {
    notFound();
  }

  const seller = listing.seller as unknown as {
    _id?: string;
    name?: string;
    email?: string;
  };
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
            </div>
            <div className="rounded-full bg-sand px-5 py-3 text-2xl font-black text-clay">
              {formatPrice(listing.price)}
            </div>
          </div>
          <p className="mt-6 whitespace-pre-line text-base leading-7 text-ink/75">
            {listing.description}
          </p>
        </div>
      </section>
      <aside className="space-y-6">
        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.25em] text-ink/45">Seller</p>
          <h2 className="mt-3 text-2xl font-bold text-ink">{seller?.name}</h2>
          <p className="mt-2 text-sm text-ink/60">{seller?.email}</p>
        </div>
        {session?.user ? (
          isSeller ? (
            <div className="rounded-[2rem] border border-ink/10 bg-white p-6 text-sm text-ink/65 shadow-card">
              This is your listing. Buyers will contact you through the marketplace inbox.
            </div>
          ) : (
            <ContactSellerForm listingId={listing._id} sellerId={sellerId} />
          )
        ) : (
          <div className="rounded-[2rem] border border-ink/10 bg-white p-6 text-sm text-ink/65 shadow-card">
            <p>Log in to contact the seller and start a chat.</p>
            <Link href="/login" className="mt-4 inline-flex rounded-full bg-forest px-4 py-2 font-semibold text-white">
              Log in
            </Link>
          </div>
        )}
      </aside>
    </main>
  );
}
