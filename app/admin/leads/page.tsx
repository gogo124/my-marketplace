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
                <h2 className="text-xl font-bold text-ink">{lead.listingId?.title || lead.activityId?.title || "Lead"}</h2>
                <p className="mt-2 text-sm text-ink/60">
                  Seller: {lead.sellerId?.name || "User"} • {lead.sellerId?.email || "-"}
                </p>
                <p className="mt-2 text-sm text-ink/60">
                  Buyer: {lead.buyerId?.name || "Guest"} • {lead.buyerId?.email || "-"}
                </p>
                <p className="mt-2 text-sm text-ink/60">Type: {lead.type}</p>
                <p className="mt-2 text-sm text-ink/60">Source: {lead.source || "-"}</p>
                <p className="mt-2 text-sm text-ink/60">Status: {lead.status || "new"}</p>
                {lead.isExternalOrder ? <p className="mt-2 text-sm text-ink/60">External order: Yes</p> : null}
                {lead.customProductName ? <p className="mt-2 text-sm text-ink/60">Custom product: {lead.customProductName}</p> : null}
                {lead.unitPrice ? <p className="mt-2 text-sm text-ink/60">Price: {lead.unitPrice} DH</p> : null}
                {lead.quantity ? <p className="mt-2 text-sm text-ink/60">Quantity: {lead.quantity}</p> : null}
                {lead.name ? <p className="mt-2 text-sm text-ink/60">Name: {lead.name}</p> : null}
                {lead.phone ? <p className="mt-2 text-sm text-ink/60">Phone: {lead.phone}</p> : null}
                {lead.city ? <p className="mt-2 text-sm text-ink/60">City: {lead.city}</p> : null}
                {lead.message ? <p className="mt-2 text-sm text-ink/60">Message: {lead.message}</p> : null}
                {lead.notes ? <p className="mt-2 text-sm text-ink/60">Notes: {lead.notes}</p> : null}
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
