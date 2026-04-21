import Link from "next/link";
import { redirect } from "next/navigation";
import { AgencyProfileForm } from "@/components/agency-profile-form";
import { AgencyTripManager } from "@/components/agency-trip-manager";
import { getAuthSession } from "@/lib/auth";
import { getAgencyDashboardData } from "@/lib/agency";

export default async function AgencyDashboardPage() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const dashboard = await getAgencyDashboardData(session.user.id);
  const isAgencyUser = session.user.role === "agency" || Boolean(dashboard.profile?._id);

  return (
    <main className="page-shell space-y-8">
      <section className="rounded-[2.75rem] bg-forest px-8 py-10 text-white shadow-card">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">Agency dashboard</p>
        <h1 className="mt-4 text-4xl font-black">Manage your agency profile, trips, and inbox.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">
          View your trips, reservations, remaining seats, leads, and messages from one simple dashboard.
        </p>
        {dashboard.profile?._id ? (
          <Link href={`/agencies/${dashboard.profile._id}`} className="mt-6 inline-flex rounded-full bg-white px-5 py-3 font-semibold text-forest">
            View public profile
          </Link>
        ) : null}
      </section>

      {!isAgencyUser ? (
        <section className="rounded-[2rem] bg-white p-6 shadow-card">
          <h2 className="text-2xl font-black text-ink">Become an agency</h2>
          <p className="mt-3 text-sm text-ink/60">
            Complete your agency profile to activate the dashboard and publish trips.
          </p>
          <div className="mt-6">
            <AgencyProfileForm profile={dashboard.profile} />
          </div>
        </section>
      ) : (
        <>
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-[2rem] bg-white p-6 shadow-card"><p className="text-sm text-ink/50">Trips</p><p className="mt-3 text-3xl font-black text-ink">{dashboard.stats.tripsCount}</p></div>
            <div className="rounded-[2rem] bg-white p-6 shadow-card"><p className="text-sm text-ink/50">Reservations</p><p className="mt-3 text-3xl font-black text-ink">{dashboard.stats.reservationsCount}</p></div>
            <div className="rounded-[2rem] bg-white p-6 shadow-card"><p className="text-sm text-ink/50">Remaining seats</p><p className="mt-3 text-3xl font-black text-ink">{dashboard.stats.remainingSeats}</p></div>
            <div className="rounded-[2rem] bg-white p-6 shadow-card"><p className="text-sm text-ink/50">Leads</p><p className="mt-3 text-3xl font-black text-ink">{dashboard.stats.leadsCount}</p></div>
            <div className="rounded-[2rem] bg-white p-6 shadow-card"><p className="text-sm text-ink/50">Messages</p><p className="mt-3 text-3xl font-black text-ink">{dashboard.stats.messagesCount}</p></div>
          </section>

          <AgencyProfileForm profile={dashboard.profile} />
          <AgencyTripManager trips={dashboard.trips as any[]} />

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[2rem] bg-white p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-ink">Reservations</h2>
                <span className="text-sm text-ink/60">{dashboard.reservations.length} total</span>
              </div>
              {dashboard.reservations.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {dashboard.reservations.map((reservation: any) => (
                    <div key={reservation._id} className="rounded-[1.5rem] border border-ink/10 p-4">
                      <p className="font-semibold text-ink">{reservation.trip?.title || "Trip"}</p>
                      <p className="mt-2 text-sm text-ink/60">{reservation.user?.name || reservation.customerName || "Guest"}</p>
                      <p className="mt-2 text-sm text-ink/60">Seats: {reservation.seats}</p>
                      <p className="mt-2 text-sm text-ink/60">{reservation.phoneNumber || reservation.user?.email || "-"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-sm text-ink/60">No reservations yet.</p>
              )}
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-ink">Leads and messages</h2>
                <span className="text-sm text-ink/60">Latest activity</span>
              </div>
              <div className="mt-6 space-y-4">
                {dashboard.leads.length > 0 ? (
                  dashboard.leads.map((lead: any) => (
                    <div key={lead._id} className="rounded-[1.5rem] border border-ink/10 p-4">
                      <p className="font-semibold text-ink">Lead: {lead.type}</p>
                      <p className="mt-2 text-sm text-ink/60">
                        {new Date(lead.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-ink/60">No leads yet.</p>
                )}
                {dashboard.conversations.length > 0 ? (
                  dashboard.conversations.map((conversation: any) => (
                    <Link key={conversation._id} href={`/messages/${conversation._id}`} className="block rounded-[1.5rem] border border-ink/10 p-4">
                      <p className="font-semibold text-ink">{conversation.listing?.title || "Conversation"}</p>
                      <p className="mt-2 text-sm text-ink/60">
                        {new Date(conversation.lastMessageAt).toLocaleString()}
                      </p>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-ink/60">No messages yet.</p>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
