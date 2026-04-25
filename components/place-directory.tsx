"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PlaceSaveButton } from "@/components/place-save-button";
import { VerificationBadge } from "@/components/verification-badge";
import { SiteLocale, withLocale } from "@/lib/i18n";

function fallbackCoordinates(placeId: string) {
  let sum = 0;

  for (const character of placeId) {
    sum += character.charCodeAt(0);
  }

  return {
    x: 12 + (sum % 70),
    y: 18 + ((sum * 7) % 60)
  };
}

export function PlaceDirectory({
  places,
  locale,
  initialFilters,
  isSignedIn
}: {
  places: any[];
  locale: SiteLocale;
  initialFilters: { q?: string; city?: string; category?: string; bestSeason?: string; safety?: string };
  isSignedIn: boolean;
}) {
  const [query, setQuery] = useState(initialFilters.q || "");
  const [city, setCity] = useState(initialFilters.city || "");
  const [category, setCategory] = useState(initialFilters.category || "");
  const [bestSeason, setBestSeason] = useState(initialFilters.bestSeason || "");
  const [safety, setSafety] = useState(initialFilters.safety || "");
  const [savedOnly, setSavedOnly] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState(places[0]?._id || "");

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      const haystack = `${place.name} ${place.city} ${place.category} ${place.description}`.toLowerCase();
      const matchesQuery = query.trim() ? haystack.includes(query.trim().toLowerCase()) : true;
      const matchesCity = city.trim() ? String(place.city || "").toLowerCase().includes(city.trim().toLowerCase()) : true;
      const matchesCategory = category.trim() ? String(place.category || "").toLowerCase().includes(category.trim().toLowerCase()) : true;
      const matchesSeason = bestSeason.trim() ? String(place.bestSeason || "").toLowerCase().includes(bestSeason.trim().toLowerCase()) : true;
      const matchesSafety = safety.trim() ? String(place.safety || "").toLowerCase().includes(safety.trim().toLowerCase()) : true;
      const matchesSaved = savedOnly ? Boolean(place.isSaved) : true;
      return matchesQuery && matchesCity && matchesCategory && matchesSeason && matchesSafety && matchesSaved;
    });
  }, [bestSeason, category, city, places, query, safety, savedOnly]);

  const selectedPlace = filteredPlaces.find((place) => place._id === selectedPlaceId) || filteredPlaces[0] || null;

  return (
    <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-5">
        <div className="rounded-[2rem] bg-white p-5 shadow-card">
          <div className="grid gap-3 md:grid-cols-2">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={locale === "ar" ? "ابحث عن المكان" : "Chercher un spot"} className="rounded-2xl border border-ink/10 px-4 py-3" />
            <input value={city} onChange={(event) => setCity(event.target.value)} placeholder={locale === "ar" ? "المدينة" : "Ville"} className="rounded-2xl border border-ink/10 px-4 py-3" />
            <input value={category} onChange={(event) => setCategory(event.target.value)} placeholder={locale === "ar" ? "الفئة" : "Categorie"} className="rounded-2xl border border-ink/10 px-4 py-3" />
            <input value={bestSeason} onChange={(event) => setBestSeason(event.target.value)} placeholder={locale === "ar" ? "أفضل موسم" : "Saison"} className="rounded-2xl border border-ink/10 px-4 py-3" />
            <input value={safety} onChange={(event) => setSafety(event.target.value)} placeholder={locale === "ar" ? "الأمان" : "Securite"} className="rounded-2xl border border-ink/10 px-4 py-3 md:col-span-2" />
          </div>
          {isSignedIn ? (
            <label className="mt-4 inline-flex items-center gap-2 text-sm text-ink/70">
              <input type="checkbox" checked={savedOnly} onChange={(event) => setSavedOnly(event.target.checked)} />
              {locale === "ar" ? "اعرض الأماكن المحفوظة فقط" : "Afficher seulement les spots sauvegardes"}
            </label>
          ) : null}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {filteredPlaces.map((place) => (
            <article key={place._id} className="overflow-hidden rounded-[2rem] bg-white shadow-card">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={place.images?.[0] || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"}
                  alt={place.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="space-y-3 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-clay">{place.category}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-black text-ink">{place.name}</h3>
                      <VerificationBadge type="place" status={place.status} locale={locale} />
                    </div>
                    <p className="mt-1 text-sm text-ink/60">{place.city}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPlaceId(place._id)}
                    className="rounded-full border border-ink/10 px-3 py-2 text-sm font-semibold text-ink"
                  >
                    {locale === "ar" ? "على الخريطة" : "Sur la carte"}
                  </button>
                </div>
                <p className="line-clamp-3 text-sm leading-7 text-ink/65">{place.description}</p>
                <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">
                  <span>{place.bestSeason}</span>
                  <span>{place.safety}</span>
                  <span>{place.ratingAverage ? `${place.ratingAverage}/5` : locale === "ar" ? "بدون تقييم" : "Sans avis"}</span>
                  <span>{place.storyCount || 0} {locale === "ar" ? "قصص" : "recits"}</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink/60">
                  <PlaceSaveButton
                    placeId={place._id}
                    initialSaved={Boolean(place.isSaved)}
                    initialCount={Number(place.savedCount || 0)}
                    disabled={!isSignedIn}
                  />
                  <Link href={withLocale(`/camping/${place._id}`, locale)} className="rounded-full bg-forest px-4 py-2 font-semibold text-white">
                    {locale === "ar" ? "عرض التفاصيل" : "Voir details"}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[2rem] bg-white p-5 shadow-card">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-clay">{locale === "ar" ? "الخريطة" : "Carte"}</p>
              <h2 className="mt-2 text-2xl font-black text-ink">{locale === "ar" ? "الخريطة التفاعلية" : "Carte interactive"}</h2>
            </div>
            <p className="text-sm text-ink/55">{filteredPlaces.length} {locale === "ar" ? "مكان" : "spots"}</p>
          </div>
          <div className="relative mt-5 h-[520px] overflow-hidden rounded-[1.8rem] bg-[radial-gradient(circle_at_20%_20%,rgba(184,138,68,0.25),transparent_25%),radial-gradient(circle_at_80%_30%,rgba(40,75,63,0.18),transparent_30%),linear-gradient(180deg,#f7f1e7_0%,#f1e6d5_100%)]">
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(40,75,63,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(40,75,63,0.2)_1px,transparent_1px)] [background-size:56px_56px]" />
            {filteredPlaces.map((place) => {
              const fallback = fallbackCoordinates(place._id);
              const x =
                place.coordinates?.lng !== undefined ? 50 + (Number(place.coordinates.lng) / 180) * 35 : fallback.x;
              const y =
                place.coordinates?.lat !== undefined ? 50 - (Number(place.coordinates.lat) / 90) * 28 : fallback.y;

              return (
                <button
                  key={place._id}
                  type="button"
                  onClick={() => setSelectedPlaceId(place._id)}
                  style={{ left: `${Math.max(8, Math.min(92, x))}%`, top: `${Math.max(10, Math.min(88, y))}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-2 text-xs font-bold shadow-card ${
                    selectedPlace?._id === place._id ? "border-clay bg-clay text-white" : "border-white/80 bg-white text-ink"
                  }`}
                >
                  {place.name}
                </button>
              );
            })}
          </div>
        </div>

        {selectedPlace ? (
          <div className="rounded-[2rem] bg-forest p-6 text-white shadow-card">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/60">{selectedPlace.city}</p>
            <h3 className="mt-3 text-3xl font-black">{selectedPlace.name}</h3>
            <p className="mt-3 text-sm leading-7 text-white/75">{selectedPlace.description}</p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-white/10 px-3 py-2">{selectedPlace.bestSeason}</span>
              <span className="rounded-full bg-white/10 px-3 py-2">{selectedPlace.safety}</span>
              <span className="rounded-full bg-white/10 px-3 py-2">
                {selectedPlace.ratingAverage ? `${selectedPlace.ratingAverage}/5` : locale === "ar" ? "بدون تقييم" : "Sans avis"}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-2">
                {selectedPlace.savedCount || 0} {locale === "ar" ? "حفظ" : "sauvegardes"}
              </span>
            </div>
            <Link href={withLocale(`/camping/${selectedPlace._id}`, locale)} className="mt-6 inline-flex rounded-full bg-white px-5 py-3 font-semibold text-forest shadow-card">
              {locale === "ar" ? "افتح الصفحة" : "Ouvrir la page"}
            </Link>
          </div>
        ) : (
          <div className="rounded-[2rem] bg-white p-6 text-sm text-ink/60 shadow-card">
            {locale === "ar" ? "لا توجد أماكن مطابقة للفلاتر." : "Aucun spot ne correspond aux filtres."}
          </div>
        )}
      </div>
    </section>
  );
}
