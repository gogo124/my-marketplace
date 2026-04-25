import Link from "next/link";
import { PlaceDirectory } from "@/components/place-directory";
import { PlaceForm } from "@/components/place-form";
import { getBestPlaces, getPlaces, getTrendingPlaces } from "@/lib/camping";
import { getAuthSession } from "@/lib/auth";
import { buildLoginPath } from "@/lib/auth-flow";
import { getDirection, resolveLocale, withLocale } from "@/lib/i18n";

export default async function CampingPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string; q?: string; city?: string; category?: string; bestSeason?: string; safety?: string; submitted?: string }>;
}) {
  const { lang, q = "", city = "", category = "", bestSeason = "", safety = "", submitted = "" } = await searchParams;
  const locale = resolveLocale(lang);
  const session = await getAuthSession();
  const [places, trendingPlaces, bestPlaces] = await Promise.all([
    getPlaces({ q, city, category, bestSeason, safety, userId: session?.user?.id }),
    getTrendingPlaces(4),
    getBestPlaces(4)
  ]);
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
        <div className="rounded-[2.75rem] bg-forest px-6 py-10 text-white shadow-card sm:px-8">
          <p className="text-sm uppercase tracking-[0.3em] text-white/60">Camping Discovery</p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
            {locale === "ar" ? "اكتشف أماكن التخييم" : "Decouvrir les lieux de camping"}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-white/75">
            {locale === "ar"
              ? "بطاقات أماكن + خريطة تفاعلية + مراجعات وقصص رحلة، مع ربط تلقائي بالرحلات المنظمة والمنتجات المناسبة للشراء."
              : "Cartes, carte interactive, avis, recits et liens automatiques vers les voyages agences et produits utiles a acheter."}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">01</p>
              <p className="mt-3 text-lg font-bold">{locale === "ar" ? "ابحث وفلتر" : "Filtrer vite"}</p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">02</p>
              <p className="mt-3 text-lg font-bold">{locale === "ar" ? "شاهد الخريطة" : "Lire la carte"}</p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">03</p>
              <p className="mt-3 text-lg font-bold">{locale === "ar" ? "احفظ وشارك" : "Sauver et raconter"}</p>
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
            {trendingPlaces.map((place: any) => (
              <Link key={place._id} href={withLocale(`/camping/${place._id}`, locale)} className="rounded-[1.5rem] border border-ink/10 p-4 transition hover:bg-sand/40">
                <p className="font-bold text-ink">{place.name}</p>
                <p className="mt-1 text-sm text-ink/60">{place.city} • {place.category}</p>
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-ink">{locale === "ar" ? "الأفضل تقييماً" : "Mieux notes"}</h2>
            <span className="text-sm text-ink/50">{bestPlaces.length}</span>
          </div>
          <div className="mt-5 grid gap-3">
            {bestPlaces.map((place: any) => (
              <Link key={place._id} href={withLocale(`/camping/${place._id}`, locale)} className="rounded-[1.5rem] border border-ink/10 p-4 transition hover:bg-sand/40">
                <p className="font-bold text-ink">{place.name}</p>
                <p className="mt-1 text-sm text-ink/60">{place.ratingAverage}/5 • {place.reviewCount} {locale === "ar" ? "مراجعة" : "avis"}</p>
              </Link>
            ))}
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
