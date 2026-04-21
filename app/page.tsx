import Link from "next/link";
import { ListingCard } from "@/components/listing-card";
import { getListings } from "@/lib/data";
import { resolveLocale, siteCopy, withLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const copy = siteCopy[locale];
  const listings = await getListings().catch(() => []);

  return (
    <main dir={locale === "ar" ? "rtl" : "ltr"} className="page-shell space-y-10">
      <section className="grid gap-8 overflow-hidden rounded-[2.75rem] bg-forest px-8 py-10 text-white shadow-card lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <span className="section-kicker">
            {copy.heroBadge}
          </span>
          <h1 className="max-w-3xl text-5xl font-black leading-[1.1] sm:text-6xl">
            {copy.heroTitle}
          </h1>
          <p className="max-w-2xl text-base leading-8 text-white/75">
            {copy.heroBody}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={withLocale("/travel-partners", locale)}
              className="rounded-full bg-white px-5 py-3 font-semibold text-forest shadow-card"
            >
              {copy.heroPrimaryCta}
            </Link>
            <Link
              href={withLocale("/listings/new", locale)}
              className="rounded-full border border-white/20 px-5 py-3 font-semibold text-white"
            >
              {copy.heroSecondaryCta}
            </Link>
          </div>
        </div>
        <div className="grid gap-4 rounded-[2rem] bg-white/10 p-5 backdrop-blur">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5">
            <p className="text-sm uppercase tracking-[0.25em] text-white/60">Moroccan Trip</p>
            <p className="mt-3 text-3xl font-black">Travel partners, listings, and secure contact.</p>
            <p className="mt-3 text-sm leading-7 text-white/70">
              One place to publish plans, discover trips, and connect with verified users across Morocco.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.75rem] bg-sand p-5 text-ink">
              <p className="text-sm uppercase tracking-[0.25em] text-ink/50">Currency</p>
              <p className="mt-3 text-3xl font-black">DH</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-white/60">Languages</p>
              <p className="mt-3 text-3xl font-black">AR / FR</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-ink">{copy.listingsTitle}</h2>
            <p className="text-sm text-ink/60">{copy.listingsBody}</p>
          </div>
        </div>
        {listings.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing: any) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-[2rem] border border-dashed border-ink/20 p-10 text-center">
            <h3 className="text-2xl font-bold text-ink">{copy.emptyListingsTitle}</h3>
            <p className="mt-2 text-sm text-ink/60">{copy.emptyListingsBody}</p>
          </div>
        )}
      </section>
    </main>
  );
}
