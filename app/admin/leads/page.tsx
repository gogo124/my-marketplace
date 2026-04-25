import { AdminMutationButton } from "@/components/admin-mutation-button";
import { getAdminLeads } from "@/lib/admin";

export default async function AdminLeadsPage() {
  const leads = await getAdminLeads();

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <h1 className="text-3xl font-black text-ink">Leads</h1>
        <p className="mt-3 text-sm text-ink/60">Inspect lead records and remove invalid or abusive lead activity.</p>
      </section>

      <section className="grid gap-4">
        {leads.map((lead: any) => (
          <article key={lead._id} className="rounded-[2rem] bg-white p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-ink">{lead.listingId?.title || "Lead"}</h2>
                <p className="mt-2 text-sm text-ink/60">
                  Seller: {lead.sellerId?.name || "User"} • {lead.sellerId?.email || "-"}
                </p>
                <p className="mt-2 text-sm text-ink/60">
                  Buyer: {lead.buyerId?.name || "Guest"} • {lead.buyerId?.email || "-"}
                </p>
                <p className="mt-2 text-sm text-ink/60">Type: {lead.type}</p>
                <p className="mt-2 text-sm text-ink/60">Status: {lead.status || "new"}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <AdminMutationButton
                  endpoint={`/api/admin/leads/${lead._id}`}
                  method="DELETE"
                  label="Delete lead"
                  variant="danger"
                  confirmText="Delete this lead?"
                />
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
