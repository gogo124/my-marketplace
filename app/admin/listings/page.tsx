import { AdminMutationButton } from "@/components/admin-mutation-button";
import { getAdminListings } from "@/lib/admin";

export default async function AdminListingsPage() {
  const listings = await getAdminListings();

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <h1 className="text-3xl font-black text-ink">Listings</h1>
        <p className="mt-3 text-sm text-ink/60">Inspect marketplace listings and remove abusive or low-quality entries.</p>
      </section>

      <section className="grid gap-4">
        {listings.map((listing: any) => (
          <article key={listing._id} className="rounded-[2rem] bg-white p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-ink">{listing.title}</h2>
                <p className="mt-2 text-sm text-ink/60">
                  {listing.type} • {listing.category} • {listing.location}
                </p>
                <p className="mt-2 text-sm text-ink/60">
                  Seller: {listing.seller?.name || "User"} • {listing.seller?.email || "-"}
                </p>
                <p className="mt-2 text-sm text-ink/60">Status: {listing.status || "active"}</p>
                <p className="mt-2 text-sm text-ink/60 line-clamp-3">{listing.description}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <AdminMutationButton
                  endpoint={`/api/admin/listings/${listing._id}`}
                  method="DELETE"
                  label="Delete listing"
                  variant="danger"
                  confirmText="Delete this listing?"
                />
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
