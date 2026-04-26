import Image from "next/image";
import Link from "next/link";
import { TravelPostCard } from "@/components/travel-post-card";
import { TravelPostForm } from "@/components/travel-post-form";
import { getAuthSession } from "@/lib/auth";
import { buildLoginPath } from "@/lib/auth-flow";
import { resolveLocale, siteCopy, withLocale } from "@/lib/i18n";
import { getTravelPosts } from "@/lib/travel-posts";

export default async function TravelPartnersPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string; destination?: string; date?: string }>;
}) {
  const { lang, destination = "", date = "" } = await searchParams;
  const locale = resolveLocale(lang);
  const copy = siteCopy[locale];
  const session = await getAuthSession().catch(() => null);
  const loginHref = buildLoginPath("/travel-partners", `lang=${locale}${destination ? `&destination=${encodeURIComponent(destination)}` : ""}${date ? `&date=${encodeURIComponent(date)}` : ""}`, locale);
  const posts = await getTravelPosts({ destination, date, userId: session?.user?.id }).catch(() => []);

  return (
    <main dir={locale === "ar" ? "rtl" : "ltr"} className="page-shell space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden rounded-[2.75rem] shadow-[0_24px_70px_rgba(15,61,46,0.22)]">
          <Image
            src="/images/travel-partner.jpg"
            alt={locale === "ar" ? "رفقاء سفر في المغرب" : "Compagnons de voyage au Maroc"}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(7,31,24,0.88),rgba(15,61,46,0.68),rgba(15,61,46,0.35))]" />
          <div className="relative grid gap-6 px-6 py-10 text-white sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:px-10 lg:py-12">
            <div className="space-y-5">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold tracking-[0.25em] text-white/85">
                Moroccan Trip
              </span>
              <h1 className="text-4xl font-black leading-[1.08] sm:text-5xl lg:text-6xl">
                {locale === "ar" ? "ابحث عن رفيق سفر" : copy.travelPageTitle}
              </h1>
              <p className="max-w-2xl text-sm leading-8 text-white/80 sm:text-base">
                {locale === "ar"
                  ? "تواصل مع مسافرين يشاركونك نفس الوجهة والاهتمام، وخططوا للرحلة بأمان ووضوح."
                  : "Trouvez des voyageurs qui partagent la meme destination et les memes envies, puis planifiez votre trajet en toute confiance."}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="#publish-form" className="rounded-full bg-white px-5 py-3 font-semibold text-forest shadow-card">
                  {copy.publishTitle}
                </Link>
                <Link href={withLocale("/", locale)} className="rounded-full border border-white/20 px-5 py-3 font-semibold text-white">
                  {copy.heroSecondaryCta}
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/60">01</p>
                  <p className="mt-2 font-bold">{locale === "ar" ? "أنشئ إعلانك" : "Creer une annonce"}</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/60">02</p>
                  <p className="mt-2 font-bold">{locale === "ar" ? "حدد الوجهة والوقت" : "Fixer la destination"}</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/60">03</p>
                  <p className="mt-2 font-bold">{locale === "ar" ? "تواصل بأمان" : "Echanger en securite"}</p>
                </div>
              </div>
            </div>
            <div className="grid gap-3">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">{locale === "ar" ? "آمن" : "Securise"}</p>
                <p className="mt-2 text-lg font-bold">{locale === "ar" ? "تواصل آمن" : "Contact securise"}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">{locale === "ar" ? "اهتمامات" : "Interets"}</p>
                <p className="mt-2 text-lg font-bold">{locale === "ar" ? "نفس الاهتمامات" : "Meme passion"}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">{locale === "ar" ? "مجتمع" : "Communaute"}</p>
                <p className="mt-2 text-lg font-bold">{locale === "ar" ? "مجتمع مسافرين" : "Communaute voyageurs"}</p>
              </div>
            </div>
          </div>

          <form action="/travel-partners" className="relative border-t border-white/10 bg-white/10 p-4 backdrop-blur sm:p-5">
            <input type="hidden" name="lang" value={locale} />
            <div className="grid gap-3 sm:grid-cols-[1fr_0.7fr_auto_auto]">
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
              <button className="rounded-2xl bg-[#f97316] px-5 py-3 font-semibold text-white shadow-card">
                {copy.search}
              </button>
              <Link href={withLocale("/travel-partners", locale)} className="rounded-2xl border border-white/20 px-5 py-3 text-center font-semibold text-white">
                {copy.clear}
              </Link>
            </div>
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
              <Link href={loginHref} className="inline-flex rounded-full bg-forest px-5 py-3 font-semibold text-white shadow-card">
                {copy.login}
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          locale === "ar" ? "خطة واضحة قبل الانطلاق" : "Plan clair avant depart",
          locale === "ar" ? "تواصل مع مسافرين حقيقيين" : "Parlez a de vrais voyageurs",
          locale === "ar" ? "رحلات منسقة بأمان" : "Trajets coordonnes en securite"
        ].map((item) => (
          <div key={item} className="rounded-[2rem] bg-white p-5 shadow-card">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-clay">{locale === "ar" ? "ثقة" : "Confiance"}</p>
            <p className="mt-3 text-lg font-black text-ink">{item}</p>
          </div>
        ))}
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-black text-ink">{copy.cardsTitle}</h2>
            <p className="text-sm text-ink/60">{copy.cardsBody}</p>
          </div>
          <p className="text-sm text-ink/55">
            {locale === "ar"
              ? "استعمل زر الاهتمام قبل التواصل باش تبين النية الجدية."
              : "Utilisez le bouton d'interet avant contact pour signaler une vraie intention."}
          </p>
        </div>

        {posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post: any) => (
              <TravelPostCard
                key={post._id}
                locale={locale}
                post={post}
                canReport={Boolean(session?.user)}
                isSignedIn={Boolean(session?.user)}
              />
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
