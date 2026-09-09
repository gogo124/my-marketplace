import type { Metadata } from "next";
import dynamicImport from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { TravelPostCard } from "@/components/travel-post-card";
import { getAuthSession } from "@/lib/auth";
import { buildLoginPath } from "@/lib/auth-flow";
import { resolveLocale, siteCopy, withLocale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import { getTravelPostsPage } from "@/lib/travel-posts";

const TravelPostForm = dynamicImport(() => import("@/components/travel-post-form").then((module) => module.TravelPostForm), {
  loading: () => <div className="h-[520px] animate-pulse rounded-[2.75rem] bg-white/70 shadow-card" />
});

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams
}: {
  searchParams: Promise<{ lang?: string; destination?: string; city?: string; gender?: string }>;
}): Promise<Metadata> {
  const { lang, destination = "", city = "", gender = "" } = await searchParams;
  const locale = resolveLocale(lang);
  const suffix = [destination, city, gender].filter(Boolean).join(" - ");

  return buildPageMetadata({
    title:
      locale === "ar"
        ? `رفيق سفر${suffix ? ` - ${suffix}` : ""}`
        : `Partenaire de voyage${suffix ? ` - ${suffix}` : ""}`,
    description:
      locale === "ar"
        ? "اعثر على رفقاء سفر، أعلن عن وجهتك، وتواصل مع مؤشرات أوضح للثقة والسلامة."
        : "Trouvez des compagnons de voyage, publiez votre destination et contactez avec de meilleurs signaux de confiance et de securite.",
    path: "/travel-partners",
    image: "/images/travel-partner.jpg"
  });
}

export default async function TravelPartnersPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string; destination?: string; city?: string; date?: string; gender?: string; page?: string }>;
}) {
  const { lang, destination = "", city = "", date = "", gender = "", page = "1" } = await searchParams;
  const locale = resolveLocale(lang);
  const copy = siteCopy[locale];
  const session = await getAuthSession().catch(() => null);
  const currentPage = Math.max(1, Number(page) || 1);
  const loginHref = buildLoginPath(
    "/travel-partners",
    `lang=${locale}${destination ? `&destination=${encodeURIComponent(destination)}` : ""}${city ? `&city=${encodeURIComponent(city)}` : ""}${date ? `&date=${encodeURIComponent(date)}` : ""}${gender ? `&gender=${encodeURIComponent(gender)}` : ""}${currentPage ? `&page=${currentPage}` : ""}`,
    locale
  );
  const result = await getTravelPostsPage({ destination, city, date, gender, userId: session?.user?.id, page: currentPage, pageSize: 12 }).catch(() => ({
    posts: [],
    pagination: { page: 1, pageSize: 12, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
  }));
  const posts = result.posts;

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
            className="object-cover object-[center_48%]"
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
                  {locale === "ar" ? "انشر رحلتك" : "Publier votre trajet"}
                </Link>
                <Link href="#travel-posts" className="rounded-full border border-white/20 px-5 py-3 font-semibold text-white">
                  {locale === "ar" ? "استكشف الرفقاء" : "Explorer les annonces"}
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
                <p className="mt-2 text-lg font-bold">{locale === "ar" ? "تواصل مع نية واضحة" : "Contact avec intention claire"}</p>
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
            <div className="grid gap-3 lg:grid-cols-[1.1fr_0.8fr_0.7fr_0.7fr_auto_auto]">
              <input type="text" name="destination" defaultValue={destination} placeholder={copy.searchPlaceholder} className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-ink outline-none shadow-card" />
              <input type="text" name="city" defaultValue={city} placeholder={locale === "ar" ? "المدينة" : "Ville"} className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-ink outline-none shadow-card" />
              <input type="date" name="date" defaultValue={date} className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-ink outline-none shadow-card" />
              <select name="gender" defaultValue={gender} className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-ink outline-none shadow-card">
                <option value="">{locale === "ar" ? "الجنس اختياري" : "Genre optionnel"}</option>
                <option value="male">{locale === "ar" ? "ذكر" : "Male"}</option>
                <option value="female">{locale === "ar" ? "أنثى" : "Female"}</option>
              </select>
              <button className="rounded-2xl bg-[#f97316] px-5 py-3 font-semibold text-white shadow-card">{locale === "ar" ? "ابحث عن رفيق سفر" : "Chercher un compagnon"}</button>
              <Link href={withLocale("/travel-partners", locale)} className="rounded-2xl border border-white/20 px-5 py-3 text-center font-semibold text-white">{copy.clear}</Link>
            </div>
          </form>
        </div>

        <div id="publish-form" className="relative overflow-hidden rounded-[2.75rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(246,241,232,0.98))] p-1 shadow-card">
          <div className="absolute inset-x-8 top-0 h-24 rounded-b-[2rem] bg-[radial-gradient(circle,rgba(184,138,68,0.2),transparent_70%)]" />
          {session?.user ? <TravelPostForm /> : (
            <div className="space-y-5 rounded-[2.25rem] border border-white/80 bg-white/90 p-6 shadow-card backdrop-blur">
              <span className="inline-flex rounded-full bg-forest px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-white">Moroccan Trip</span>
              <h2 className="text-2xl font-black leading-tight text-ink">{copy.publishTitle}</h2>
              <p className="text-sm leading-7 text-ink/65">{copy.loginToPublish}</p>
              <Link href={loginHref} className="inline-flex rounded-full bg-forest px-5 py-3 font-semibold text-white shadow-card">{copy.login}</Link>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { title: locale === "ar" ? "خطة واضحة قبل الانطلاق" : "Plan clair avant depart", body: locale === "ar" ? "اظهر الوجهة والتاريخ والهدف من الإعلان خلال ثوانٍ." : "La destination, la date et l'intention sont visibles en quelques secondes." },
          { title: locale === "ar" ? "تواصل مع مسافرين حقيقيين" : "Parlez a de vrais voyageurs", body: locale === "ar" ? "بطاقات أوضح مع اسم، تاريخ، وعدد المهتمين." : "Des cartes plus claires avec nom, date et nombre d'interesses." },
          { title: locale === "ar" ? "إحساس أفضل بالأمان" : "Meilleure perception de securite", body: locale === "ar" ? "إشارات الثقة والتبليغ والوصول إلى التواصل بشكل منظم." : "Des signaux de confiance, des options de signalement et un acces au contact plus structure." }
        ].map((item) => (
          <div key={item.title} className="rounded-[2rem] bg-white p-5 shadow-card">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-clay">{locale === "ar" ? "ثقة" : "Confiance"}</p>
            <p className="mt-3 text-lg font-black text-ink">{item.title}</p>
            <p className="mt-2 text-sm leading-7 text-ink/60">{item.body}</p>
          </div>
        ))}
      </section>

      <section id="travel-posts" className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-black text-ink">{copy.cardsTitle}</h2>
            <p className="text-sm text-ink/60">
              {posts.length > 0 ? locale === "ar" ? `${result.pagination.total} إعلان مطابق للفلتر الحالي مع وجهة، تاريخ، وإشارات ثقة أوضح.` : `${result.pagination.total} matching posts with destination, date and clearer trust signals.` : copy.cardsBody}
            </p>
          </div>
          <p className="text-sm text-ink/55">{locale === "ar" ? "استعمل زر الاهتمام قبل التواصل باش تبين النية الجدية." : "Utilisez le bouton d'interet avant contact pour signaler une vraie intention."}</p>
        </div>

        {posts.length > 0 ? (
          <div className="space-y-5">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post: any) => <TravelPostCard key={post._id} locale={locale} post={post} canReport={Boolean(session?.user)} isSignedIn={Boolean(session?.user)} />)}
            </div>
            <div className="flex items-center justify-between text-sm text-ink/60">
              <span>{result.pagination.page} / {result.pagination.totalPages}</span>
              <div className="flex gap-3">
                {result.pagination.hasPreviousPage ? <Link href={withLocale(`/travel-partners?destination=${encodeURIComponent(destination)}&city=${encodeURIComponent(city)}&date=${encodeURIComponent(date)}&gender=${encodeURIComponent(gender)}&page=${currentPage - 1}`, locale)} className="rounded-full border border-ink/10 px-4 py-2">{locale === "ar" ? "السابق" : "Previous"}</Link> : null}
                {result.pagination.hasNextPage ? <Link href={withLocale(`/travel-partners?destination=${encodeURIComponent(destination)}&city=${encodeURIComponent(city)}&date=${encodeURIComponent(date)}&gender=${encodeURIComponent(gender)}&page=${currentPage + 1}`, locale)} className="rounded-full border border-ink/10 px-4 py-2">{locale === "ar" ? "التالي" : "Next"}</Link> : null}
              </div>
            </div>
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
