import { AdminMutationButton } from "@/components/admin-mutation-button";
import { getAdminPlaces } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminPlacesPage() {
  const places = await getAdminPlaces();

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <h1 className="text-3xl font-black text-ink">Camping Places</h1>
        <p className="mt-3 text-sm text-ink/60">Pending places stay hidden from public discovery until approved here.</p>
      </section>

      <section className="grid gap-4">
        {places.map((place: any) => (
          <article key={place._id} className="rounded-[2rem] bg-white p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <h2 className="text-xl font-bold text-ink">{place.name}</h2>
                <p className="mt-2 text-sm text-ink/60">{place.city} • {place.category} • {place.status === "approved" ? "visible publicly" : "pending review"}</p>
                <p className="mt-2 text-sm text-ink/60">By {place.createdBy?.name || "User"} • {place.createdBy?.email || "-"}</p>
                <p className="mt-2 text-sm text-ink/60 line-clamp-4">{place.description}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {place.status !== "approved" ? (
                  <AdminMutationButton endpoint={`/api/admin/places/${place._id}`} method="PATCH" label="Approve place" />
                ) : (
                  <AdminMutationButton endpoint={`/api/admin/places/${place._id}`} method="PATCH" body={{ status: "pending" }} label="Move to pending" variant="neutral" />
                )}
                <AdminMutationButton
                  endpoint={`/api/admin/places/${place._id}`}
                  method="DELETE"
                  label="Delete place"
                  variant="danger"
                  confirmText="Delete this place and all related stories/reviews?"
                />
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
