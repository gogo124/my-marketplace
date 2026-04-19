import { ListingCard } from "@/components/listing-card";
import { getListings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const listings = await getListings().catch(() => []);

  return (
    <main className="page-shell space-y-10">
      <section className="grid gap-8 rounded-[2.5rem] bg-forest px-8 py-10 text-white shadow-card lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-5">
          <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em]">
            Local Marketplace
          </span>
          <h1 className="max-w-3xl text-5xl font-black leading-tight">
            Buy, sell, and chat around your city in one focused marketplace.
          </h1>
          <p className="max-w-2xl text-base text-white/75">
            Soukly is an Avito-style marketplace built with Next.js 15, MongoDB, secure auth,
            listing management, and buyer-seller messaging.
          </p>
        </div>
        <div className="grid gap-4 rounded-[2rem] bg-white/10 p-5">
          <div className="rounded-[1.5rem] bg-white/10 p-5">
            <p className="text-sm uppercase tracking-[0.25em] text-white/60">Stack</p>
            <p className="mt-3 text-2xl font-black">Next.js 15 + MongoDB + NextAuth</p>
          </div>
          <div className="rounded-[1.5rem] bg-sand p-5 text-ink">
            <p className="text-sm uppercase tracking-[0.25em] text-ink/50">Features</p>
            <p className="mt-3 text-xl font-bold">Auth, listings, protected seller inbox, chat</p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-ink">Fresh listings</h2>
            <p className="text-sm text-ink/60">Recent ads from marketplace users.</p>
          </div>
        </div>
        {listings.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing: any) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-ink/20 bg-white/70 p-10 text-center">
            <h3 className="text-2xl font-bold text-ink">No listings yet</h3>
            <p className="mt-2 text-sm text-ink/60">
              Create the first listing after signing up. The app is already wired to MongoDB.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
