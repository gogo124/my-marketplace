import { AdminMutationButton } from "@/components/admin-mutation-button";
import { getAdminAgencies } from "@/lib/admin";
import { getAgencyVerificationLabel, getSellerVerificationLabel } from "@/lib/trust";

export default async function AdminAgenciesPage() {
  const agencies = await getAdminAgencies();

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <h1 className="text-3xl font-black text-ink">Agencies</h1>
        <p className="mt-3 text-sm text-ink/60">Verify agencies, review ownership, and monitor agency-side marketplace quality.</p>
      </section>

      <section className="grid gap-4">
        {agencies.map((agency: any) => (
          (() => {
            const sellerStatus =
              agency.user?.sellerVerificationStatus || (agency.user?.verified ? "verified" : "unverified");

            return (
          <article key={agency._id} className="rounded-[2rem] bg-white p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-ink">{agency.name}</h2>
                <p className="mt-2 text-sm text-ink/60">{agency.city}</p>
                <p className="mt-2 text-sm text-ink/60">
                  Agency verification: {getAgencyVerificationLabel(agency.verificationStatus, "fr")}
                </p>
                <p className="mt-2 text-sm text-ink/60">
                  Owner: {agency.user?.name || "User"} • {agency.user?.email || "-"}
                </p>
                <p className="mt-2 text-sm text-ink/60">
                  Seller verification: {getSellerVerificationLabel(sellerStatus, "fr")}
                </p>
                <p className="mt-2 text-sm text-ink/60">Trips published: {agency.tripsCount || 0}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {agency.verificationStatus !== "pending" ? (
                  <AdminMutationButton
                    endpoint={`/api/admin/agencies/${agency._id}`}
                    body={{ verificationStatus: "pending" }}
                    label="Mark pending"
                    variant="neutral"
                  />
                ) : null}
                {agency.verificationStatus !== "verified" ? (
                  <AdminMutationButton
                    endpoint={`/api/admin/agencies/${agency._id}`}
                    body={{ verificationStatus: "verified" }}
                    label="Verify agency"
                  />
                ) : (
                  <AdminMutationButton
                    endpoint={`/api/admin/agencies/${agency._id}`}
                    body={{ verificationStatus: "unverified" }}
                    label="Remove verification"
                    variant="neutral"
                  />
                )}
                <AdminMutationButton
                  endpoint={`/api/admin/agencies/${agency._id}`}
                  method="DELETE"
                  label="Delete agency"
                  variant="danger"
                  confirmText="Delete this agency profile and related trips/reservations?"
                />
              </div>
            </div>
          </article>
            );
          })()
        ))}
      </section>
    </div>
  );
}
