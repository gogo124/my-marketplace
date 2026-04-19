import Link from "next/link";
import { formatPrice } from "@/lib/utils";

type ListingCardProps = {
  listing: {
    _id: string;
    title: string;
    price: number;
    category: string;
    location: string;
    images?: string[];
    seller?: { name?: string };
  };
};

export function ListingCard({ listing }: ListingCardProps) {
  const image = listing.images?.[0] || "https://images.unsplash.com/photo-1507089947368-19c1da9775ae";

  return (
    <Link
      href={`/listings/${listing._id}`}
      className="group overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-card transition hover:-translate-y-1"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={image}
          alt={listing.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold text-ink">{listing.title}</h3>
          <span className="text-lg font-black text-clay">{formatPrice(listing.price)}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-ink/70">
          <span>{listing.location}</span>
          <span>{listing.category}</span>
        </div>
        <p className="text-sm text-ink/60">Seller: {listing.seller?.name || "Marketplace user"}</p>
      </div>
    </Link>
  );
}
