import Image from "next/image";
import Link from "next/link";
import { VerificationBadge } from "@/components/verification-badge";
import { localizeRecordField, resolveLocale, SiteLocale, siteCopy, withLocale } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";

type ListingCardProps = {
  listing: {
    _id: string;
    title: string;
    price: number;
    type?: string;
    category: string;
    location: string;
    images?: string[];
    seller?: { name?: string; sellerVerificationStatus?: string; verified?: boolean };
  };
  locale?: SiteLocale;
};

export function ListingCard({ listing, locale = "ar" }: ListingCardProps) {
  const safeLocale = resolveLocale(locale);
  const copy = siteCopy[safeLocale];
  const image = listing.images?.[0] || "https://images.unsplash.com/photo-1507089947368-19c1da9775ae";
  const title = localizeRecordField(listing as Record<string, any>, "title", safeLocale, listing.title);
  const category = localizeRecordField(listing as Record<string, any>, "category", safeLocale, listing.category);
  const location = localizeRecordField(listing as Record<string, any>, "location", safeLocale, listing.location);

  return (
    <Link
      href={withLocale(`/listings/${listing._id}`, safeLocale)}
      className="group overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-card transition hover:-translate-y-1"
    >
      <div className="relative h-56 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold text-ink">{title}</h3>
          <span className="text-lg font-black text-clay">{formatPrice(listing.price, safeLocale)}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-ink/70">
          <span>{location}</span>
          <span>{category}</span>
        </div>
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-ink/45">
          <span>{listing.type === "rental" ? copy.rental : copy.sale}</span>
          <span>{copy.viewDetails}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-ink/60">
          <p>{copy.seller}: {listing.seller?.name || copy.marketplaceUser}</p>
          <VerificationBadge
            type="seller"
            locale={safeLocale}
            status={listing.seller?.sellerVerificationStatus || (listing.seller?.verified ? "verified" : "unverified")}
          />
        </div>
      </div>
    </Link>
  );
}
