import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { PlaceForm } from "@/components/place-form";
import { CardGridSkeleton } from "@/components/page-skeletons";
import { getCampingHighlights, getPlaces } from "@/lib/camping";
import { getAuthSession } from "@/lib/auth";
import { buildLoginPath } from "@/lib/auth-flow";
import { getDirection, resolveLocale, withLocale } from "@/lib/i18n";
import { logServerError } from "@/lib/server-log";

const PlaceDirectory = dynamic(() => import("@/components/place-directory").then((module) => module.PlaceDirectory), {
  loading: () => <CardGridSkeleton count={4} />
});

export default async function CampingPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string; q?: string; city?: string; category?: string; bestSeason?: string; safety?: string; submitted?: string }>;
}) {
  const { lang, q = "", city = "", category = "", bestSeason = "", safety = "", submitted = "" } = await searchParams;
  const locale = resolveLocale(lang);
  const session = await getAuthSession().catch((error) => {
    logServerError("page.camping.auth", error);
    return null;
  });
  const [places, highlights] = await Promise.all([
    getPlaces({ q, city, category, bestSeason, safety, userId: session?.user?.id }).catch((error) => {
      logServerError("page.camping.places", error, { q, city, category, bestSeason, safety });
      return [];
    }),
    getCampingHighlights(4).catch((error) => {
      logServerError("page.camping.highlights", error);
      return { trendingPlaces: [], bestPlaces: [] };
    })
  ]);
  const { trendingPlaces, bestPlaces } = highlights;
  const loginHref = buildLoginPath("/camping", `lang=${locale}`, locale);

  return (
    <main dir={getDirection(locale)} className="page-shell space-y-8">
      {submitted === "pending" ? (
        <section className="rounded-[1.8rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 shadow-card">
          {locale === "ar"
            ? "تم إرسال المكان للمراجعة. لن يظهر في الاكتشاف العام حتى توافق عليه الإدارة."
            : "Le spot a bien ete soumis. Il restera en attente jusqu'a validation par l'administration."}
        </section>
      ) : null}
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden rounded-[2.75rem] shadow-[0_24px_70px_rgba(15,61,46,0.22)]">
          <Image
            src="/images/camping.jpg"
            alt={locale === "ar" ? "أماكن تخييم في المغرب" : "Lieux de camping au Maroc"}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(7,31,24,0.88),rgba(15,61,46,0.7),rgba(15,61,46,0.35))]" />
          <div className="relative grid gap-6 px-6 py-10 text-white sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:px-10 lg:py-12">
            <div className="space-y-5">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold tracking-[0.25em] text-white/85">
                Camping Morocco
              </span>
              <h1 className="text-4xl font-black leading-[1.08] sm:text-5xl">
                {locale === "ar" ? "اكتشف أماكن التخييم" : "Decouvrir les lieux de camping"}
              </h1>
              <p className="max-w-2xl text-sm leading-8 text-white/80 sm:text-base">
                {locale === "ar"
                  ? "اكتشف أماكن تخييم آمنة ومميزة في المغرب مع صور واقعية، خريطة واضحة، وتقييمات تساعدك تختار المكان المناسب."
                  : "Decouvrez des spots de camping sures et remarquables au Maroc avec de vraies photos, une carte claire et des avis utiles."}
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/60">01</p>
                  <p className="mt-2 font-bold">{locale === "ar" ? "ابحث وفلتر" : "Filtrer vite"}</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/60">02</p>
                  <p className="mt-2 font-bold">{locale === "ar" ? "شاهد الخريطة" : "Lire la carte"}</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/60">03</p>
                  <p className="mt-2 font-bold">{locale === "ar" ? "احفظ وشارك" : "Sauver et partager"}</p>
                </div>
              </div>
            </div>
            <div className="grid gap-3">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">{locale === "ar" ? "آمن" : "Securise"}</p>
                <p className="mt-2 text-lg font-bold">{locale === "ar" ? "مسارات ومواقع مختارة" : "Spots selectionnes"}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">{locale === "ar" ? "خريطة" : "Carte"}</p>
                <p className="mt-2 text-lg font-bold">{locale === "ar" ? "شرح واضح قبل الزيارة" : "Infos claires avant visite"}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">{locale === "ar" ? "مجتمع" : "Communaute"}</p>
                <p className="mt-2 text-lg font-bold">{locale === "ar" ? "شارك تجربتك مع الآخرين" : "Partagez votre experience"}</p>
              </div>
            </div>
          </div>
        </div>

        {session?.user ? (
          <PlaceForm />
        ) : (
          <div className="rounded-[2.25rem] bg-white p-6 shadow-card">
            <p className="text-sm uppercase tracking-[0.25em] text-clay">Camping</p>
            <h2 className="mt-3 text-2xl font-black text-ink">
              {locale === "ar" ? "سجل الدخول لإضافة مكان جديد" : "Connectez-vous pour ajouter un spot"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-ink/65">
              {locale === "ar"
                ? "يمكنك إضافة مكان، صور، خريطة، قصص ومراجعات بعد تسجيل الدخول."
                : "Ajoutez spot, images, carte, avis et histoires apres connexion."}
            </p>
            <Link href={loginHref} className="mt-5 inline-flex rounded-full bg-forest px-5 py-3 font-semibold text-white">
              {locale === "ar" ? "تسجيل الدخول" : "Connexion"}
            </Link>
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-ink">{locale === "ar" ? "الأماكن الرائجة" : "Spots tendance"}</h2>
            <span className="text-sm text-ink/50">{trendingPlaces.length}</span>
          </div>
          <div className="mt-5 grid gap-3">
            {trendingPlaces.length > 0 ? (
              trendingPlaces.map((place: any) => (
                <Link
                  key={place._id}
                  href={withLocale(`/camping/${place._id}`, locale)}
                  className="group flex items-center gap-4 rounded-[1.5rem] border border-ink/10 bg-slate-50 p-3 transition hover:bg-slate-100"
                >
                  <div className="relative h-18 w-24 overflow-hidden rounded-[1.2rem] bg-sand">
                    <Image src={place.images?.[0] || "/images/camping.jpg"} alt={place.name} fill sizes="96px" className="object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay">{place.category}</p>
                    <p className="truncate text-lg font-black text-ink">{place.name}</p>
                    <p className="text-sm text-ink/60">{place.city} • {place.safety}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-forest shadow-sm">
                    {locale === "ar" ? "احجز الآن" : "Explore"}
                  </span>
                </Link>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-ink/20 bg-slate-50 p-6 text-sm text-ink/60">
                {locale === "ar" ? "لا توجد أماكن رائجة حالياً." : "Aucun spot tendance pour le moment."}
              </div>
            )}
          </div>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-ink">{locale === "ar" ? "الأفضل تقييماً" : "Mieux notes"}</h2>
            <span className="text-sm text-ink/50">{bestPlaces.length}</span>
          </div>
          <div className="mt-5 grid gap-3">
            {bestPlaces.length > 0 ? (
              bestPlaces.map((place: any) => (
                <Link
                  key={place._id}
                  href={withLocale(`/camping/${place._id}`, locale)}
                  className="group flex items-center gap-4 rounded-[1.5rem] border border-ink/10 bg-slate-50 p-3 transition hover:bg-slate-100"
                >
                  <div className="relative h-18 w-24 overflow-hidden rounded-[1.2rem] bg-sand">
                    <Image src={place.images?.[0] || "/images/camping.jpg"} alt={place.name} fill sizes="96px" className="object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay">{place.category}</p>
                    <p className="truncate text-lg font-black text-ink">{place.name}</p>
                    <p className="text-sm text-ink/60">
                      {place.ratingAverage}/5 • {place.reviewCount} {locale === "ar" ? "مراجعة" : "avis"}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-forest shadow-sm">
                    {locale === "ar" ? "اكتشف" : "Explore"}
                  </span>
                </Link>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-ink/20 bg-slate-50 p-6 text-sm text-ink/60">
                {locale === "ar" ? "لا توجد أماكن مميزة حالياً." : "Aucun spot mieux note pour le moment."}
              </div>
            )}
          </div>
        </div>
      </section>

      <PlaceDirectory
        places={places}
        locale={locale}
        initialFilters={{ q, city, category, bestSeason, safety }}
        isSignedIn={Boolean(session?.user)}
      />
    </main>
  );
}
