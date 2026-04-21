import { notFound } from "next/navigation";
import { getAgencyProfileById, getAgencyTrips } from "@/lib/agency";

export default async function AgencyProfilePage({
  params
}: {
  params: Promise<{ agencyId: string }>;
}) {
  const { agencyId } = await params;
  const profile = await getAgencyProfileById(agencyId);

  if (!profile) {
    notFound();
  }

  const trips = await getAgencyTrips(agencyId);
  const rating = Number(profile.rating || 0);
  const coverImage = profile.coverImage || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";
  const logo = profile.logo || "https://images.unsplash.com/photo-1488646953014-85cb44e25828";
  const whatsappDigits = String(profile.whatsapp || "").replace(/\D/g, "");

  return (
    <main className="page-shell space-y-8">
      <section className="overflow-hidden rounded-[2.75rem] bg-white shadow-card">
        <div className="relative h-64 overflow-hidden">
          <img src={coverImage} alt={profile.name} className="h-full w-full object-cover" />
        </div>
        <div className="grid gap-6 px-6 py-8 lg:grid-cols-[160px_1fr] lg:px-8">
          <div className="-mt-20 h-32 w-32 overflow-hidden rounded-[2rem] border-4 border-white bg-sand shadow-card">
            <img src={logo} alt={profile.name} className="h-full w-full object-cover" />
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black text-ink">{profile.name}</h1>
                <p className="mt-2 text-sm text-ink/60">{profile.city}</p>
                <p className="mt-2 text-sm text-ink/60">
                  Rating: {rating > 0 ? rating.toFixed(1) : "No ratings yet"}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {whatsappDigits ? (
                  <a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noreferrer" className="rounded-full bg-forest px-4 py-2 font-semibold text-white">
                    WhatsApp
                  </a>
                ) : null}
                {profile.phone ? (
                  <a href={`tel:${String(profile.phone).replace(/\s+/g, "")}`} className="rounded-full border border-ink/10 px-4 py-2 font-semibold text-ink">
                    Call
                  </a>
                ) : null}
              </div>
            </div>
            <p className="max-w-3xl text-base leading-7 text-ink/75">{profile.description || "Professional travel agency profile."}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.25em] text-ink/45">Phone</p>
          <p className="mt-3 text-lg font-bold text-ink">{profile.phone || "-"}</p>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.25em] text-ink/45">WhatsApp</p>
          <p className="mt-3 text-lg font-bold text-ink">{profile.whatsapp || "-"}</p>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <p className="text-sm uppercase tracking-[0.25em] text-ink/45">Trips</p>
          <p className="mt-3 text-lg font-bold text-ink">{trips.length}</p>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-black text-ink">Agency trips</h2>
          <p className="mt-2 text-sm text-ink/60">Available trips published by this agency.</p>
        </div>
        {trips.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {trips.map((trip: any) => {
              const remainingSeats = Math.max(Number(trip.seatsTotal || 0) - Number(trip.seatsBooked || 0), 0);

              return (
                <article key={trip._id} className="rounded-[2rem] bg-white p-6 shadow-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-clay">{trip.destination}</p>
                      <h3 className="mt-2 text-2xl font-black text-ink">{trip.title}</h3>
                    </div>
                    <span className="rounded-full bg-sand px-4 py-2 text-sm font-semibold text-forest">
                      {trip.price} DH
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-ink/70">{trip.description}</p>
                  <div className="mt-5 space-y-2 text-sm text-ink/60">
                    <p>{trip.city}</p>
                    <p>
                      {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </p>
                    <p>Remaining seats: {remainingSeats}</p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[2rem] bg-white p-8 text-sm text-ink/60 shadow-card">
            No trips available yet.
          </div>
        )}
      </section>
    </main>
  );
}
