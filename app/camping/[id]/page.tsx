import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingCard } from "@/components/listing-card";
import { PlaceReviewForm } from "@/components/place-review-form";
import { PlaceSaveButton } from "@/components/place-save-button";
import { PlaceStoryForm } from "@/components/place-story-form";
import { ReportForm } from "@/components/report-form";
import { ReviewReplyForm } from "@/components/review-reply-form";
import { VerificationBadge } from "@/components/verification-badge";
import { LightboxImage } from "@/components/lightbox-image";
import { getAuthSession } from "@/lib/auth";
import { buildLoginPath } from "@/lib/auth-flow";
import { getPlaceById } from "@/lib/camping";
import { formatLocaleDate, getDirection, resolveLocale, SiteLocale, withLocale } from "@/lib/i18n";
import { canUserReviewPlace } from "@/lib/reviews";
import { formatPrice } from "@/lib/utils";

function buildMapEmbedUrl(place: any) {
  if (place.coordinates?.lat && place.coordinates?.lng) {
    return `https://maps.google.com/maps?q=${place.coordinates.lat},${place.coordinates.lng}&z=11&output=embed`;
  }

  return "";
}

function getBestTimeHint(place: any, locale: SiteLocale) {
  const season = String(place.bestSeason || "").toLowerCase();

  if (season.includes("print") || season.includes("ربيع")) {
    return locale === "ar" ? "الربيع يعطي طقس معتدل ومسارات أوضح للمشي والتخييم." : "Le printemps offre souvent une meteo douce et des acces plus confortables.";
  }

  if (season.includes("ete") || season.includes("summer") || season.includes("صيف")) {
    return locale === "ar" ? "يفضل الوصول مبكراً، حمل الماء، وتجنب ساعات الحر القوي." : "Arrivez tot, prevoyez de l'eau et evitez les heures de forte chaleur.";
  }

  if (season.includes("autom") || season.includes("خريف")) {
    return locale === "ar" ? "الخريف مناسب للهدوء والمناظر، مع متابعة تغيرات الرياح والبرد ليلاً." : "L'automne est agreable, avec un oeil sur le vent et la fraicheur du soir.";
  }

  if (season.includes("hiver") || season.includes("winter") || season.includes("شت")) {
    return locale === "ar" ? "تحقق من البرودة والرياح قبل الانطلاق، وخذ تجهيزات دافئة كافية." : "Verifiez le froid et le vent avant depart, avec un equipement chaud adapte.";
  }

  return locale === "ar" ? "راجع توقعات الطقس قبل الانطلاق وخطط وقت الوصول قبل الغروب." : "Consultez la meteo avant depart et planifiez une arrivee avant la tombee du jour.";
}

export default async function PlaceDetailsPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { id } = await params;
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const session = await getAuthSession();
  const place = await getPlaceById(id, session?.user?.id);

  if (!place || place.status !== "approved") {
    notFound();
  }

  const loginHref = buildLoginPath(`/camping/${id}`, `lang=${locale}`, locale);
  const mapEmbedUrl = buildMapEmbedUrl(place);
  const placeOwnerId = place.createdBy?._id ? String(place.createdBy._id) : "";
  const isPlaceOwner = session?.user?.id === placeOwnerId;
  const placeReviewEligibility =
    session?.user?.id && !isPlaceOwner
      ? await canUserReviewPlace(session.user.id, id)
      : null;
  const canSubmitPlaceReview = Boolean(placeReviewEligibility?.allowed);
  const placeReviewBlockedMessage =
    session?.user?.id && !isPlaceOwner && placeReviewEligibility && !placeReviewEligibility.allowed
      ? placeReviewEligibility.reason
      : "";

  return (
    <main dir={getDirection(locale)} className="page-shell grid gap-8 lg:grid-cols-[1.18fr_0.82fr]">
      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {(place.images?.length ? place.images : ["/images/camping.jpg"]).map((image: string, index: number) => (
            <LightboxImage key={`${image}-${index}`} src={image} alt={place.name} images={place.images?.length ? place.images : ["/images/camping.jpg"]} index={index} wrapperClassName="relative block h-72 overflow-hidden rounded-[2rem] bg-white shadow-card" imageClassName="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority={index === 0} />
          ))}
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-clay">{place.category}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-black text-ink">{place.name}</h1>
                <VerificationBadge type="place" status={place.status} locale={locale} />
              </div>
              <p className="mt-3 text-sm text-ink/60">{place.city}</p>
              <p className="mt-3 text-sm text-ink/60">{locale === "ar" ? "الأمان" : "Securite"}: {place.safety}</p>
              <p className="mt-2 text-sm text-ink/60">{locale === "ar" ? "أفضل موسم" : "Meilleure saison"}: {place.bestSeason}</p>
            </div>
            <div className="rounded-[1.5rem] bg-sand px-5 py-4 text-right">
              <p className="text-sm text-ink/50">{locale === "ar" ? "التقييم" : "Note"}</p>
              <p className="mt-2 text-3xl font-black text-clay">{place.ratingAverage ? `${place.ratingAverage}/5` : "--"}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">
                {place.reviewCount || 0} {locale === "ar" ? "مراجعات" : "avis"} • {place.savedCount || 0} {locale === "ar" ? "حفظ" : "sauvegardes"}
              </p>
            </div>
          </div>
          <p className="mt-6 whitespace-pre-line text-base leading-8 text-ink/75">{place.description}</p>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[1.8rem] bg-white p-5 shadow-card">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-clay">{locale === "ar" ? "الخريطة" : "Carte"}</p>
            <p className="mt-3 text-lg font-bold text-ink">{locale === "ar" ? "نقطة واضحة للوصول" : "Point d'arrivee clair"}</p>
            <p className="mt-2 text-sm leading-7 text-ink/65">
              {mapEmbedUrl
                ? locale === "ar"
                  ? "الخريطة المضمنة والرابط الخارجي كيساعدوك تضبط نقطة الوصول قبل الخروج."
                  : "La carte integree et le lien externe aident a verifier le point d'arrivee avant depart."
                : locale === "ar"
                  ? "استعمل الرابط الخارجي لتأكيد الطريق قبل الخروج."
                  : "Utilisez le lien externe pour confirmer l'itineraire avant depart."}
            </p>
          </article>
          <article className="rounded-[1.8rem] bg-white p-5 shadow-card">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-clay">{locale === "ar" ? "الطقس وأفضل وقت" : "Meteo et meilleur moment"}</p>
            <p className="mt-3 text-lg font-bold text-ink">{place.bestSeason}</p>
            <p className="mt-2 text-sm leading-7 text-ink/65">{getBestTimeHint(place, locale)}</p>
          </article>
          <article className="rounded-[1.8rem] bg-white p-5 shadow-card">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-clay">{locale === "ar" ? "ملاحظات السلامة" : "Notes securite"}</p>
            <p className="mt-3 text-lg font-bold text-ink">{place.safety}</p>
            <p className="mt-2 text-sm leading-7 text-ink/65">
              {locale === "ar"
                ? "راجع الطريق، الشبكة، والمعدات الأساسية قبل تأكيد الرحلة أو الانطلاق."
                : "Verifiez acces, couverture reseau et equipement essentiel avant de confirmer le deplacement."}
            </p>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[2rem] bg-white p-6 shadow-card">
            <h2 className="text-2xl font-black text-ink">{locale === "ar" ? "الرحلات المرتبطة" : "Voyages lies"}</h2>
            <div className="mt-5 grid gap-3">
              {place.trips?.length ? (
                place.trips.map((trip: any) => (
                  <article key={trip._id} className="rounded-[1.4rem] border border-ink/10 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-bold text-ink">{trip.title}</p>
                        <p className="mt-1 text-sm text-ink/60">{trip.agency?.name} • {trip.city}</p>
                        <p className="mt-1 text-sm text-ink/60">
                          {formatLocaleDate(trip.startDate, locale)} - {formatLocaleDate(trip.endDate, locale)}
                        </p>
                      </div>
                      <span className="rounded-full bg-sand px-3 py-2 text-sm font-bold text-clay">{formatPrice(trip.price, locale)}</span>
                    </div>
                  </article>
                ))
              ) : (
                <p className="text-sm text-ink/60">{locale === "ar" ? "لا توجد رحلات مرتبطة حالياً." : "Aucun voyage lie pour le moment."}</p>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-card">
            <h2 className="text-2xl font-black text-ink">{locale === "ar" ? "منتجات وخدمات للشراء" : "Produits et services a acheter"}</h2>
            <div className="mt-5 grid gap-4">
              {place.products?.length ? (
                place.products.map((listing: any) => <ListingCard key={listing._id} listing={listing} locale={locale} />)
              ) : (
                <p className="text-sm text-ink/60">{locale === "ar" ? "لا توجد منتجات مرتبطة حالياً." : "Aucun produit lie pour le moment."}</p>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[2rem] bg-white p-6 shadow-card">
            <h2 className="text-2xl font-black text-ink">{locale === "ar" ? "المراجعات" : "Avis"}</h2>
            <div className="mt-5 space-y-4">
              {place.reviews?.length ? (
                place.reviews.map((review: any) => (
                  <article key={review._id} className="rounded-[1.4rem] border border-ink/10 p-4">
                    <p className="font-semibold text-ink">
                      {review.author?.name || (locale === "ar" ? "مستخدم" : "Utilisateur")} • {"★".repeat(Number(review.rating || 0))}{"☆".repeat(Math.max(5 - Number(review.rating || 0), 0))}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-ink/65">{review.comment}</p>
                    {Array.isArray(review.images) && review.images.length > 0 ? (
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        {review.images.map((image: string) => (
                          <LightboxImage key={image} src={image} alt="Review image" images={review.images} wrapperClassName="relative block h-24 overflow-hidden rounded-[1rem] bg-sand" imageClassName="object-cover" sizes="160px" />
                        ))}
                      </div>
                    ) : review.image ? (
                      <LightboxImage src={review.image} alt="Review image" images={[review.image]} wrapperClassName="relative mt-3 block h-32 overflow-hidden rounded-[1.2rem] bg-sand" imageClassName="object-cover" sizes="300px" />
                    ) : null}
                    {review.providerReply ? (
                      <div className="mt-3 rounded-[1rem] bg-sand/35 p-4 text-sm text-ink/70">
                        <p className="font-semibold text-ink">{locale === "ar" ? "رد الجهة المسؤولة" : "Reponse du responsable"}</p>
                        <p className="mt-2">{review.providerReply}</p>
                      </div>
                    ) : null}
                    {isPlaceOwner ? <ReviewReplyForm reviewId={review._id} initialReply={review.providerReply || ""} /> : null}
                  </article>
                ))
              ) : (
                <p className="text-sm text-ink/60">{locale === "ar" ? "لا توجد مراجعات بعد." : "Pas encore d'avis."}</p>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-card">
            <h2 className="text-2xl font-black text-ink">{locale === "ar" ? "قصص الرحلات" : "Histoires de voyage"}</h2>
            <div className="mt-5 space-y-4">
              {place.stories?.length ? (
                place.stories.map((story: any) => (
                  <article key={story._id} className="rounded-[1.4rem] border border-ink/10 p-4">
                    <p className="font-semibold text-ink">{story.title}</p>
                    <p className="mt-1 text-sm text-ink/50">
                      {story.author?.name || (locale === "ar" ? "مستخدم" : "Utilisateur")}
                      {story.tripDate ? ` • ${formatLocaleDate(story.tripDate, locale)}` : ""}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-ink/65">{story.body}</p>
                    {story.image ? (
                      <LightboxImage src={story.image} alt={story.title} images={[story.image]} wrapperClassName="relative mt-3 block h-36 overflow-hidden rounded-[1.2rem] bg-sand" imageClassName="object-cover" sizes="300px" />
                    ) : null}
                    {session?.user ? <ReportForm targetType="story" targetId={story._id} title={locale === "ar" ? "إبلاغ عن القصة" : "Signaler l'histoire"} compact locale={locale} /> : null}
                  </article>
                ))
              ) : (
                <p className="text-sm text-ink/60">{locale === "ar" ? "لا توجد قصص بعد." : "Pas encore d'histoires."}</p>
              )}
            </div>
          </div>
        </section>
      </section>

      <aside className="space-y-6">
        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.25em] text-ink/45">{locale === "ar" ? "الإجراءات" : "Actions"}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PlaceSaveButton placeId={place._id} initialSaved={Boolean(place.isSaved)} initialCount={Number(place.savedCount || 0)} disabled={!session?.user} />
            <a href={place.mapLink} target="_blank" rel="noreferrer" className="rounded-full border border-ink/10 px-4 py-2 font-semibold text-ink">
              {locale === "ar" ? "افتح الخريطة" : "Ouvrir la carte"}
            </a>
            {session?.user ? <ReportForm targetType="place" targetId={place._id} title={locale === "ar" ? "إبلاغ عن المكان" : "Signaler le lieu"} compact locale={locale} /> : null}
          </div>
          <p className="mt-4 text-sm text-ink/60">
            {locale === "ar" ? `بواسطة ${place.createdBy?.name || "مستخدم"}` : `Par ${place.createdBy?.name || "Utilisateur"}`}
          </p>
        </div>

        <div className="rounded-[2rem] bg-white p-4 shadow-card">
          {mapEmbedUrl ? (
            <iframe title={place.name} src={mapEmbedUrl} className="h-72 w-full rounded-[1.5rem] border-0" loading="lazy" />
          ) : (
            <div className="rounded-[1.5rem] bg-sand p-6 text-sm text-ink/60">
              {locale === "ar" ? "الخريطة المضمنة غير متاحة لهذا الرابط، افتح الرابط الخارجي أعلاه." : "Carte integree indisponible pour ce lien, ouvrez le lien externe ci-dessus."}
            </div>
          )}
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <h2 className="text-xl font-black text-ink">{locale === "ar" ? "المجتمع المتجه لنفس المكان" : "Communaute vers le meme spot"}</h2>
          <div className="mt-4 space-y-3">
            {place.travelers?.length ? (
              place.travelers.map((traveler: any) => (
                <article key={traveler._id} className="rounded-[1.4rem] border border-ink/10 p-4">
                  <p className="font-semibold text-ink">{traveler.userId?.name || (locale === "ar" ? "مستخدم" : "Utilisateur")}</p>
                  <p className="mt-1 text-sm text-ink/60">{traveler.destination}</p>
                  <p className="mt-1 text-sm text-ink/60">{formatLocaleDate(traveler.date, locale)}</p>
                </article>
              ))
            ) : (
              <p className="text-sm text-ink/60">{locale === "ar" ? "لا يوجد مستخدمون مرتبطون حالياً." : "Aucun utilisateur relie pour le moment."}</p>
            )}
          </div>
        </div>

        {session?.user ? (
          <>
            {!isPlaceOwner ? <PlaceReviewForm placeId={place._id} canSubmit={canSubmitPlaceReview} blockedMessage={placeReviewBlockedMessage} /> : null}
            <PlaceStoryForm placeId={place._id} />
          </>
        ) : (
          <div className="rounded-[2rem] border border-ink/10 bg-white p-6 text-sm text-ink/65 shadow-card">
            <p>{locale === "ar" ? "سجل الدخول لحفظ المكان وإضافة مراجعة أو قصة." : "Connectez-vous pour sauvegarder, noter ou raconter."}</p>
            <Link href={loginHref} className="mt-4 inline-flex rounded-full bg-forest px-4 py-2 font-semibold text-white">
              {locale === "ar" ? "تسجيل الدخول" : "Connexion"}
            </Link>
          </div>
        )}
      </aside>
    </main>
  );
}
