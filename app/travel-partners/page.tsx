import Link from "next/link";
import { TravelPostCard } from "@/components/travel-post-card";
import { TravelPostForm } from "@/components/travel-post-form";
import { getAuthSession } from "@/lib/auth";
import { resolveLocale, siteCopy, withLocale } from "@/lib/i18n";
import { getTravelPosts } from "@/lib/travel-posts";

export const dynamic = "force-dynamic";

export default async function TravelPartnersPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string; destination?: string; date?: string }>;
}) {
  const { lang, destination = "", date = "" } = await searchParams;
  const locale = resolveLocale(lang);
  const copy = siteCopy[locale];
  const session = await getAuthSession();
  const posts = await getTravelPosts({ destination, date }).catch(() => []);

  return (
    <main dir={locale === "ar" ? "rtl" : "ltr"} className="page-shell space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden rounded-[2.75rem] bg-forest px-8 py-10 text-white shadow-card">
          <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
          <div className="max-w-3xl space-y-6">
            <span className="section-kicker">
              Moroccan Trip
            </span>
            <h1 className="max-w-3xl text-4xl font-black leading-[1.08] sm:text-6xl">
              {copy.travelPageTitle}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-white/75">{copy.travelPageBody}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="#publish-form"
                className="rounded-full bg-white px-5 py-3 font-semibold text-forest shadow-card"
              >
                {copy.publishTitle}
              </Link>
              <Link
                href={withLocale("/", locale)}
                className="rounded-full border border-white/20 px-5 py-3 font-semibold text-white"
              >
                {copy.heroSecondaryCta}
              </Link>
            </div>
            <div className="grid gap-4 pt-4 sm:grid-cols-3">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">01</p>
                <p className="mt-3 text-lg font-bold">Search by city</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">02</p>
                <p className="mt-3 text-lg font-bold">Filter by date</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">03</p>
                <p className="mt-3 text-lg font-bold">Contact travelers</p>
              </div>
            </div>
          </div>

          <form action="/travel-partners" className="mt-10 grid gap-3 rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-card backdrop-blur sm:grid-cols-[1.2fr_0.9fr_auto_auto]">
            <input type="hidden" name="lang" value={locale} />
            <input
              type="text"
              name="destination"
              defaultValue={destination}
              placeholder={copy.searchPlaceholder}
              className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-ink outline-none shadow-card"
            />
            <input
              type="date"
              name="date"
              defaultValue={date}
              className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-ink outline-none shadow-card"
            />
            <button className="rounded-2xl bg-clay px-5 py-3 font-semibold text-white shadow-card">
              {copy.search}
            </button>
            <Link
              href={withLocale("/travel-partners", locale)}
              className="rounded-2xl border border-white/20 px-5 py-3 text-center font-semibold text-white"
            >
              {copy.clear}
            </Link>
          </form>
        </div>

        <div id="publish-form" className="relative overflow-hidden rounded-[2.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(246,241,232,0.98))] p-1 shadow-card">
          <div className="absolute inset-x-8 top-0 h-24 rounded-b-[2rem] bg-[radial-gradient(circle,rgba(184,138,68,0.2),transparent_70%)]" />
          {session?.user ? (
            <TravelPostForm />
          ) : (
            <div className="space-y-5 rounded-[2.25rem] border border-white/80 bg-white/90 p-6 shadow-card backdrop-blur">
              <span className="inline-flex rounded-full bg-forest px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-white">
                Moroccan Trip
              </span>
              <h2 className="text-2xl font-black leading-tight text-ink">{copy.publishTitle}</h2>
              <p className="text-sm leading-7 text-ink/65">{copy.loginToPublish}</p>
              <Link
                href={withLocale("/login", locale)}
                className="inline-flex rounded-full bg-forest px-5 py-3 font-semibold text-white shadow-card"
              >
                {copy.login}
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-black text-ink">{copy.cardsTitle}</h2>
            <p className="text-sm text-ink/60">{copy.cardsBody}</p>
          </div>
        </div>

        {posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post: any) => (
              <TravelPostCard key={post._id} locale={locale} post={post} />
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-[2rem] border border-dashed border-ink/20 p-12 text-center">
            <h3 className="text-2xl font-bold text-ink">{copy.noPostsTitle}</h3>
            <p className="mt-3 text-sm leading-7 text-ink/60">{copy.noPostsBody}</p>
          </div>
        )}
      </section>
    </main>
  );
}
