import { AdminMutationButton } from "@/components/admin-mutation-button";
import { getAdminPartnerships } from "@/lib/admin";

export default async function AdminPartnershipsPage() {
  const partnerships = await getAdminPartnerships();

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <h1 className="text-3xl font-black text-ink">Partnerships</h1>
        <p className="mt-3 text-sm text-ink/60">Inspect agency-renter partnership requests and approve or reject them.</p>
      </section>

      <section className="grid gap-4">
        {partnerships.map((partnership: any) => (
          <article key={partnership._id} className="rounded-[2rem] bg-white p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-ink">
                  {partnership.agency?.name || "Agency"} - {partnership.renter?.name || "Renter"}
                </h2>
                <p className="mt-2 text-sm text-ink/60">Agency city: {partnership.agency?.city || "-"}</p>
                <p className="mt-2 text-sm text-ink/60">Renter city: {partnership.renter?.city || "-"}</p>
                <p className="mt-2 text-sm text-ink/60">Requested by: {partnership.requestedByRole || "-"}</p>
                <p className="mt-2 text-sm text-ink/60">Status: {partnership.status || "pending"}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <AdminMutationButton
                  endpoint="/api/partnerships"
                  body={{ partnershipId: partnership._id, status: "accepted" }}
                  label="Accept"
                />
                <AdminMutationButton
                  endpoint="/api/partnerships"
                  body={{ partnershipId: partnership._id, status: "rejected" }}
                  label="Reject"
                  variant="neutral"
                />
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
