import { AdminTripManager } from "@/components/admin-trip-manager";
import { getAdminTrips } from "@/lib/admin";

export default async function AdminTripsPage() {
  const trips = await getAdminTrips();

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <h1 className="text-3xl font-black text-ink">Trips</h1>
        <p className="mt-3 text-sm text-ink/60">
          Review published trips and manage Trip Space access for rental flow.
        </p>
      </section>

      {trips.length > 0 ? (
        <AdminTripManager trips={trips as any[]} />
      ) : (
        <section className="rounded-[2rem] bg-white p-6 shadow-card">
          <p className="text-sm text-ink/60">No trips found.</p>
        </section>
      )}
    </div>
  );
}
