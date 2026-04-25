import { AgencyStatusActions } from "@/components/agency-status-actions";
import { StatusBadge } from "@/components/status-badge";
import { getAdminRentalRequests } from "@/lib/admin";

export default async function AdminRentalRequestsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "" } = await searchParams;
  const rentalRequests = await getAdminRentalRequests(status || undefined);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <h1 className="text-3xl font-black text-ink">Rental Requests</h1>
        <p className="mt-3 text-sm text-ink/60">Inspect rental requests and update their review status.</p>
        <form className="mt-4 flex flex-wrap gap-3">
          <select name="status" defaultValue={status} className="rounded-xl border border-ink/10 px-4 py-2 text-sm">
            <option value="">All statuses</option>
            <option value="pending">Pending first</option>
            <option value="approved">Approved</option>
            <option value="delivered">Delivered</option>
            <option value="returned">Returned</option>
          </select>
          <button className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white">Filter</button>
        </form>
      </section>

      <section className="grid gap-4">
        {rentalRequests.length > 0 ? rentalRequests.map((rentalRequest: any) => (
          <article key={rentalRequest._id} className="rounded-[2rem] bg-white p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-ink">{rentalRequest.trip?.title || "Rental request"}</h2>
                <p className="mt-2 text-sm text-ink/60">Agency: {rentalRequest.agency?.name || "-"}</p>
                <p className="mt-2 text-sm text-ink/60">Name: {rentalRequest.customerName || "-"}</p>
                <p className="mt-2 text-sm text-ink/60">Phone: {rentalRequest.phoneNumber || "-"}</p>
                <p className="mt-2 text-sm text-ink/60">City: {rentalRequest.city || "-"}</p>
                <p className="mt-2 text-sm text-ink/60">Item: {rentalRequest.rentalItem?.title || "-"}</p>
                <p className="mt-2 text-sm text-ink/60">Quantity: {rentalRequest.quantity || 1} • Duration: {rentalRequest.durationDays || 1}</p>
                <p className="mt-2 text-sm text-ink/60">Total: {rentalRequest.totalPrice || 0} DH</p>
                <div className="mt-2"><StatusBadge kind="rental" status={rentalRequest.status} locale="fr" /></div>
                <p className="mt-2 text-sm text-ink/60">Created: {rentalRequest.createdAt || "-"}</p>
                {rentalRequest.notes ? <p className="mt-2 text-sm text-ink/70">{rentalRequest.notes}</p> : null}
              </div>
              <AgencyStatusActions
                endpoint="/api/rental-requests"
                idField="rentalRequestId"
                itemId={rentalRequest._id}
                status={rentalRequest.status || "pending"}
                allowedStatuses={["pending", "approved", "delivered", "returned"]}
              />
            </div>
          </article>
        )) : (
          <section className="rounded-[2rem] bg-white p-8 text-sm text-ink/60 shadow-card">
            No rental requests match this filter.
          </section>
        )}
      </section>
    </div>
  );
}
