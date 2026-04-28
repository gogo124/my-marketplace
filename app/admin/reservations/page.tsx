import { AdminMutationButton } from "@/components/admin-mutation-button";
import { AgencyStatusActions } from "@/components/agency-status-actions";
import { StatusBadge } from "@/components/status-badge";
import { getAdminReservations } from "@/lib/admin";

export default async function AdminReservationsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "" } = await searchParams;
  const reservations = await getAdminReservations(status || undefined);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <h1 className="text-3xl font-black text-ink">Reservations</h1>
        <p className="mt-3 text-sm text-ink/60">Inspect reservation records, confirm bookings, update their status, and delete invalid or abusive entries.</p>
        <form className="mt-4 flex flex-wrap gap-3">
          <select name="status" defaultValue={status} className="rounded-xl border border-ink/10 px-4 py-2 text-sm">
            <option value="">All statuses</option>
            <option value="pending">Pending first</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white">Filter</button>
        </form>
      </section>

      <section className="grid gap-4">
        {reservations.length > 0 ? reservations.map((reservation: any) => (
          <article key={reservation._id} className="rounded-[2rem] bg-white p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-ink">{reservation.trip?.title || "Reservation"}</h2>
                <p className="mt-2 text-sm text-ink/60">Agency: {reservation.agency?.name || "-"}</p>
                <p className="mt-2 text-sm text-ink/60">
                  Traveler: {reservation.user?.name || reservation.customerName || "Guest"} • {reservation.customerEmail || reservation.user?.email || "-"}
                </p>
                <p className="mt-2 text-sm text-ink/60">Phone: {reservation.phoneNumber || "-"}</p>
                <p className="mt-2 text-sm text-ink/60">City: {reservation.city || "-"}</p>
                <p className="mt-2 text-sm text-ink/60">People: {reservation.seats}</p>
                {reservation.preferredDate ? <p className="mt-2 text-sm text-ink/60">Preferred date: {String(reservation.preferredDate).slice(0, 10)}</p> : null}
                <p className="mt-2 text-sm text-ink/60">Total: {reservation.totalPrice || 0} DH</p>
                <div className="mt-2"><StatusBadge kind="reservation" status={reservation.status} locale="fr" /></div>
                {reservation.status === "confirmed" && reservation.trip?.tripCode ? (
                  <p className="mt-2 text-sm font-semibold text-clay">Trip Space ready: {reservation.trip.tripCode}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <AgencyStatusActions
                  endpoint="/api/admin/reservations"
                  idField="reservationId"
                  itemId={reservation._id}
                  status={reservation.status || "pending"}
                  allowedStatuses={["pending", "confirmed", "completed", "cancelled"]}
                />
                <AdminMutationButton
                  endpoint={`/api/admin/reservations/${reservation._id}`}
                  method="DELETE"
                  label="Delete reservation"
                  variant="danger"
                  confirmText="Delete this reservation?"
                />
              </div>
            </div>
          </article>
        )) : (
          <section className="rounded-[2rem] bg-white p-8 text-sm text-ink/60 shadow-card">
            No reservations match this filter.
          </section>
        )}
      </section>
    </div>
  );
}
