import Image from "next/image";
import { safeExternalUrl } from "@/lib/destinations";

export default function DestinationAgencies({ agencies, locale }: { agencies: any[]; locale: "ar" | "fr" | "en" }) {
  const copy = {
    ar: { book: "احجز الآن", website: "الموقع", instagram: "إنستغرام", facebook: "فيسبوك", count: "وكالة" },
    fr: { book: "Réserver", website: "Site web", instagram: "Instagram", facebook: "Facebook", count: "agences" },
    en: { book: "Book Now", website: "Website", instagram: "Instagram", facebook: "Facebook", count: "agencies" },
  }[locale];

  const items = Array.isArray(agencies) ? agencies : [];
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
      {items.map((agency: any, index: number) => {
        const name = String(agency?.name || "Agency").trim();
        const logo = safeExternalUrl(agency?.logo);
        const bookingUrl = safeExternalUrl(agency?.bookingUrl);
        const instagram = safeExternalUrl(agency?.instagram);
        const facebook = safeExternalUrl(agency?.facebook);
        const website = safeExternalUrl(agency?.website);
        const city = String(agency?.city || "").trim();
        const description = String(agency?.description || "").trim();
        return (
          <div key={agency?._id || `${name}-${index}`} className="flex flex-col gap-3 border-b border-ink/10 px-3 py-3 last:border-b-0 sm:flex-row sm:items-center sm:px-4">
            {logo ? (
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-ink/10 bg-sand">
                <Image src={logo} alt={`${name} logo`} fill sizes="40px" className="object-cover" />
              </div>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand text-sm font-black text-forest" aria-hidden="true">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black">{name}</p>
              {city ? <p className="truncate text-[11px] text-ink/45">{city}</p> : null}
              {description ? <p className="mt-0.5 line-clamp-1 text-[11px] text-ink/50">{description}</p> : null}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
              {instagram ? <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label={`${name} ${copy.instagram}`} className="rounded-lg border border-ink/10 px-2 py-1.5 text-[10px] font-bold text-ink/60 hover:border-forest hover:text-forest">IG</a> : null}
              {facebook ? <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label={`${name} ${copy.facebook}`} className="rounded-lg border border-ink/10 px-2 py-1.5 text-[10px] font-bold text-ink/60 hover:border-forest hover:text-forest">FB</a> : null}
              {website ? <a href={website} target="_blank" rel="noopener noreferrer" aria-label={`${name} ${copy.website}`} className="rounded-lg border border-ink/10 px-2 py-1.5 text-[10px] font-bold text-ink/60 hover:border-forest hover:text-forest">{copy.website}</a> : null}
              {bookingUrl ? <a href={bookingUrl} target="_blank" rel="noopener noreferrer" aria-label={`${copy.book} - ${name}`} className="rounded-lg bg-forest px-3 py-1.5 text-[11px] font-black text-white hover:opacity-90">{copy.book}</a> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
