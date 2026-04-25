import Image from "next/image";
import Link from "next/link";
import { VerificationBadge } from "@/components/verification-badge";
import { getAgencyProfiles } from "@/lib/agency";
import { formatLocaleNumber, getDirection, resolveLocale, siteCopy, withLocale } from "@/lib/i18n";
import { getAgencyVerificationLabel } from "@/lib/trust";

export default async function AgenciesPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string; q?: string; city?: string }>;
}) {
  const { lang, q = "", city = "" } = await searchParams;
  const locale = resolveLocale(lang);
  const copy = siteCopy[locale];
  const agencies = await getAgencyProfiles({ q, city }).catch(() => []);

  return (
    <main dir={getDirection(locale)} className="page-shell space-y-8">
      <section className="rounded-[2.75rem] bg-forest px-8 py-10 px-5 sm:px-8 text-white shadow-card">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">{copy.travelSide}</p>
        <h1 className="mt-4 text-4xl text-3xl font-black sm:text-4xl">{copy.heroPrimaryCta}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">
          {copy.browseAgenciesTrips}
        </p>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-black text-ink">{copy.agencyDiscovery}</h2>
            <p className="text-sm text-ink/60">{copy.agencyDiscoveryBody}</p>
          </div>
          <p className="text-sm text-ink/50">{formatLocaleNumber(agencies.length, locale)} {copy.agenciesCount}</p>
        </div>
        <form action="/agencies" className="mt-5 grid gap-3 lg:grid-cols-[1.4fr_1fr_auto_auto]">
          <input type="hidden" name="lang" value={locale} />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder={copy.searchAgencyPlaceholder}
            className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
          />
          <input
            type="text"
            name="city"
            defaultValue={city}
            placeholder={copy.city}
            className="rounded-2xl border border-ink/10 px-4 py-3 outline-none focus:ring-2 focus:ring-clay/30"
          />
          <button className="rounded-2xl bg-clay px-5 py-3 font-semibold text-white">{copy.search}</button>
          <Link href={withLocale("/agencies", locale)} className="rounded-2xl border border-ink/10 px-5 py-3 text-center font-semibold text-ink">
            {copy.clear}
          </Link>
        </form>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-clay">
            {locale === "ar" ? "كيفاش كتمشي العملية" : "Comment ca marche"}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm font-semibold text-ink">{locale === "ar" ? "1. اختار الرحلة" : "1. Choisissez le voyage"}</p>
              <p className="mt-2 text-sm leading-7 text-ink/60">
                {locale === "ar" ? "قارن بين المدن، التواريخ والمقاعد المتاحة." : "Comparez villes, dates et places disponibles."}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{locale === "ar" ? "2. دير الحجز" : "2. Envoyez la reservation"}</p>
              <p className="mt-2 text-sm leading-7 text-ink/60">
                {locale === "ar" ? "الوكالة كتراجع الطلب وكتأكد الحالة ديالو." : "L'agence verifie la demande puis confirme le statut."}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{locale === "ar" ? "3. دخل للكراء" : "3. Accedez a la location"}</p>
              <p className="mt-2 text-sm leading-7 text-ink/60">
                {locale === "ar" ? "الكراء متاح فقط بعد تأكيد الحجز وكود الرحلة." : "La location n'est disponible qu'apres confirmation et code voyage."}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-forest/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,241,232,0.96))] p-6 shadow-card">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-clay">
            {locale === "ar" ? "ملاحظة مهمة" : "Note utile"}
          </p>
          <h2 className="mt-3 text-2xl font-black text-ink">
            {locale === "ar" ? "الحجز أولاً، ثم الكراء" : "Reservation d'abord, location ensuite"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-ink/65">
            {locale === "ar"
              ? "باش تكون التجربة واضحة وآمنة، كراء المعدات مربوط بالرحلات المنظمة المؤكدة فقط."
              : "Pour garder un parcours clair et fiable, la location d'equipements est liee uniquement aux voyages organises confirmes."}
          </p>
        </div>
      </section>

      {agencies.length > 0 ? (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {agencies.map((agency: any) => {
            const logo = agency.logo || "https://images.unsplash.com/photo-1488646953014-85cb44e25828";
            const coverImage = agency.coverImage || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";

            return (
              <article key={agency._id} className="overflow-hidden rounded-[2rem] bg-white shadow-card">
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={coverImage}
                    alt={agency.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-4 p-6">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative h-16 w-16 overflow-hidden rounded-[1.5rem] bg-sand">
                      <Image src={logo} alt={agency.name} fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="truncate text-2xl font-black text-ink">{agency.name}</h3>
                        <VerificationBadge type="agency" status={agency.verificationStatus} locale={locale} />
                      </div>
                      <p className="text-sm text-ink/60">{agency.city}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-ink/45">
                        {getAgencyVerificationLabel(agency.verificationStatus, locale)} • {agency.profileCompleteness || 0}% {copy.profileComplete}
                      </p>
                    </div>
                  </div>
                  <p className="line-clamp-3 text-sm leading-7 text-ink/70">
                    {agency.description || copy.agencyProfileBody}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[1.5rem] bg-sand p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-ink/45">{copy.activeTrips}</p>
                      <p className="mt-2 text-2xl font-black text-ink">{agency.stats.tripsCount}</p>
                    </div>
                    <div className="rounded-[1.5rem] bg-sand p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-ink/45">{copy.openSeats}</p>
                      <p className="mt-2 text-2xl font-black text-ink">{agency.stats.openSeats}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link href={withLocale(`/agencies/${agency._id}`, locale)} className="rounded-full bg-forest px-4 py-2 font-semibold text-white">
                      {copy.viewAgency}
                    </Link>
                    {agency.whatsapp ? (
                      <a
                        href={`https://wa.me/${String(agency.whatsapp).replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-ink/10 px-4 py-2 font-semibold text-ink"
                      >
                        {copy.contact}
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="rounded-[2rem] bg-white p-8 text-sm text-ink/60 shadow-card">
          {copy.noAgencies}
        </section>
      )}
    </main>
  );
}
