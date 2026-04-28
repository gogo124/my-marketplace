import Link from "next/link";
import { AgencyStatusActions } from "@/components/agency-status-actions";
import { StatusBadge } from "@/components/status-badge";
import { formatLocaleDateTime, resolveLocale, SiteLocale, siteCopy, withLocale } from "@/lib/i18n";
import { getLeadStatusLabel } from "@/lib/trust";

export function AgencyStatsGrid({
  stats,
  locale = "ar"
}: {
  stats: {
    tripsCount?: number;
    reservationsCount?: number;
    rentalRequestsCount?: number;
    remainingSeats?: number;
    leadsCount?: number;
    messagesCount?: number;
    newLeadsCount?: number;
    newReservationsCount?: number;
    pendingRentalRequestsCount?: number;
  };
  locale?: SiteLocale;
}) {
  const safeLocale = resolveLocale(locale);
  const copy = siteCopy[safeLocale];
  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-6">
      <div className="rounded-[2rem] bg-white p-6 shadow-card"><p className="text-sm text-ink/50">{copy.trips}</p><p className="mt-3 text-3xl font-black text-ink">{stats.tripsCount || 0}</p></div>
      <div className="rounded-[2rem] bg-white p-6 shadow-card"><p className="text-sm text-ink/50">{copy.reservations}</p><p className="mt-3 text-3xl font-black text-ink">{stats.reservationsCount || 0}</p></div>
      <div className="rounded-[2rem] bg-white p-6 shadow-card"><p className="text-sm text-ink/50">{copy.openSeats}</p><p className="mt-3 text-3xl font-black text-ink">{stats.remainingSeats || 0}</p></div>
      <div className="rounded-[2rem] bg-white p-6 shadow-card"><p className="text-sm text-ink/50">{safeLocale === "ar" ? "طلبات الكراء" : "Demandes location"}</p><p className="mt-3 text-3xl font-black text-ink">{stats.rentalRequestsCount || 0}</p></div>
      <div className="rounded-[2rem] bg-white p-6 shadow-card"><p className="text-sm text-ink/50">{copy.messages}</p><p className="mt-3 text-3xl font-black text-ink">{stats.messagesCount || 0}</p></div>
      <div className="rounded-[2rem] bg-white p-6 shadow-card"><p className="text-sm text-ink/50">{copy.filter}</p><p className="mt-3 text-3xl font-black text-ink">{(stats.newLeadsCount || 0) + (stats.newReservationsCount || 0) + (stats.pendingRentalRequestsCount || 0)}</p></div>
    </section>
  );
}

export function AgencyOverviewSection({
  stats,
  leadsByType,
  locale = "ar"
}: {
  stats: {
    recentReservationCount?: number;
    recentRentalRequestCount?: number;
    recentLeadCount?: number;
    upcomingTripsCount?: number;
    lowSeatTripsCount?: number;
    contactedReservationsCount?: number;
    confirmedReservationsCount?: number;
    contactedLeadsCount?: number;
    acceptedRentalRequestsCount?: number;
  };
  leadsByType: {
    whatsapp?: number;
    call?: number;
    chat?: number;
  };
  locale?: SiteLocale;
}) {
  const copy = siteCopy[resolveLocale(locale)];
  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[2rem] bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-ink">Operations overview</h2>
          <span className="text-sm text-ink/60">Last 7 days</span>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.5rem] bg-sand p-4">
            <p className="text-sm text-ink/50">New reservations</p>
            <p className="mt-2 text-2xl font-black text-ink">{stats.recentReservationCount || 0}</p>
          </div>
          <div className="rounded-[1.5rem] bg-sand p-4">
            <p className="text-sm text-ink/50">Rental requests</p>
            <p className="mt-2 text-2xl font-black text-ink">{stats.recentRentalRequestCount || 0}</p>
          </div>
          <div className="rounded-[1.5rem] bg-sand p-4">
            <p className="text-sm text-ink/50">New leads</p>
            <p className="mt-2 text-2xl font-black text-ink">{stats.recentLeadCount || 0}</p>
          </div>
          <div className="rounded-[1.5rem] bg-sand p-4">
            <p className="text-sm text-ink/50">Upcoming trips</p>
            <p className="mt-2 text-2xl font-black text-ink">{stats.upcomingTripsCount || 0}</p>
          </div>
          <div className="rounded-[1.5rem] bg-sand p-4">
            <p className="text-sm text-ink/50">Low-seat trips</p>
            <p className="mt-2 text-2xl font-black text-ink">{stats.lowSeatTripsCount || 0}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.5rem] border border-ink/10 p-4">
            <p className="text-sm text-ink/50">Leads contacted</p>
            <p className="mt-2 text-2xl font-black text-ink">{stats.contactedLeadsCount || 0}</p>
          </div>
          <div className="rounded-[1.5rem] border border-ink/10 p-4">
            <p className="text-sm text-ink/50">Reservations contacted</p>
            <p className="mt-2 text-2xl font-black text-ink">{stats.contactedReservationsCount || 0}</p>
          </div>
          <div className="rounded-[1.5rem] border border-ink/10 p-4">
            <p className="text-sm text-ink/50">Reservations confirmed</p>
            <p className="mt-2 text-2xl font-black text-ink">{stats.confirmedReservationsCount || 0}</p>
          </div>
          <div className="rounded-[1.5rem] border border-ink/10 p-4">
            <p className="text-sm text-ink/50">Rental requests accepted</p>
            <p className="mt-2 text-2xl font-black text-ink">{stats.acceptedRentalRequestsCount || 0}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-ink">Lead breakdown</h2>
          <span className="text-sm text-ink/60">Simple analytics</span>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.5rem] border border-ink/10 p-4">
            <p className="text-sm text-ink/50">WhatsApp</p>
            <p className="mt-2 text-2xl font-black text-ink">{leadsByType.whatsapp || 0}</p>
          </div>
          <div className="rounded-[1.5rem] border border-ink/10 p-4">
            <p className="text-sm text-ink/50">Calls</p>
            <p className="mt-2 text-2xl font-black text-ink">{leadsByType.call || 0}</p>
          </div>
          <div className="rounded-[1.5rem] border border-ink/10 p-4">
            <p className="text-sm text-ink/50">Chats</p>
            <p className="mt-2 text-2xl font-black text-ink">{leadsByType.chat || 0}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AgencyReservationsSection({ reservations, locale = "ar" }: { reservations: any[]; locale?: SiteLocale }) {
  const safeLocale = resolveLocale(locale);
  const copy = siteCopy[safeLocale];
  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-ink">{copy.reservations}</h2>
        <span className="text-sm text-ink/60">{reservations.length}</span>
      </div>
      {reservations.length > 0 ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {reservations.map((reservation: any) => (
            <div key={reservation._id} className="rounded-[1.5rem] border border-ink/10 p-4">
              <div className="flex items-start justify-between gap-4">
                <p className="font-semibold text-ink">{reservation.trip?.title || copy.trips}</p>
                <StatusBadge kind="reservation" status={reservation.status} locale={safeLocale} />
              </div>
              {reservation.status === "pending" ? (
                <p className="mt-2 rounded-full bg-[#fff7ed] px-3 py-1 text-xs font-semibold text-[#c2410c]">
                  {safeLocale === "ar" ? "في انتظار تأكيد الوكالة" : "Waiting for agency confirmation"}
                </p>
              ) : null}
              <p className="mt-2 text-sm text-ink/60">{reservation.user?.name || reservation.customerName || copy.marketplaceUser}</p>
              <p className="mt-2 text-sm text-ink/60">{reservation.customerEmail || reservation.user?.email || "-"}</p>
              <p className="mt-2 text-sm text-ink/60">{reservation.phoneNumber || "-"}</p>
              <p className="mt-2 text-sm text-ink/60">{reservation.city || "-"}</p>
              <p className="mt-2 text-sm text-ink/60">{safeLocale === "ar" ? "عدد الأشخاص" : "Voyageurs"}: {reservation.seats}</p>
              {reservation.preferredDate ? (
                <p className="mt-2 text-sm text-ink/60">
                  {safeLocale === "ar" ? "التاريخ المطلوب" : "Date souhaitee"}: {formatLocaleDateTime(reservation.preferredDate, safeLocale)}
                </p>
              ) : null}
              <p className="mt-2 text-sm font-semibold text-clay">
                {safeLocale === "ar" ? "الإجمالي" : "Total"}: {reservation.totalPrice || 0} DH
              </p>
              {reservation.status === "confirmed" && reservation.trip?._id ? (
                <Link
                  href={withLocale(`/trip/${reservation.trip._id}`, safeLocale)}
                  className="mt-3 inline-flex rounded-full bg-[#0f3d2e] px-4 py-2 text-sm font-semibold text-white"
                >
                  {safeLocale === "ar" ? "ادخل لمساحة التريب" : "Open Trip Space"}
                </Link>
              ) : null}
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-ink/45">
                {formatLocaleDateTime(reservation.createdAt, safeLocale)}
              </p>
              <div className="mt-4">
                <AgencyStatusActions
                  endpoint="/api/agency/reservations"
                  idField="reservationId"
                  itemId={reservation._id}
                  status={reservation.status || "pending"}
                  allowedStatuses={["pending", "confirmed", "completed", "cancelled"]}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
            <p className="mt-6 text-sm text-ink/60">{copy.noMessages}</p>
      )}
    </section>
  );
}

export function AgencyRentalRequestsSection({ rentalRequests, locale = "ar" }: { rentalRequests: any[]; locale?: SiteLocale }) {
  const safeLocale = resolveLocale(locale);

  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-ink">{safeLocale === "ar" ? "طلبات الكراء" : "Demandes location"}</h2>
        <span className="text-sm text-ink/60">{rentalRequests.length}</span>
      </div>
      {rentalRequests.length > 0 ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {rentalRequests.map((rentalRequest: any) => (
            <div key={rentalRequest._id} className="rounded-[1.5rem] border border-ink/10 p-4">
              <div className="flex items-start justify-between gap-4">
                <p className="font-semibold text-ink">{rentalRequest.trip?.title || (safeLocale === "ar" ? "رحلة" : "Trip")}</p>
                <StatusBadge kind="rental" status={rentalRequest.status} locale={safeLocale} />
              </div>
              <p className="mt-2 text-sm text-ink/60">{rentalRequest.customerName}</p>
              <p className="mt-2 text-sm text-ink/60">{rentalRequest.phoneNumber}</p>
              <p className="mt-2 text-sm text-ink/60">{rentalRequest.city}</p>
              <p className="mt-2 text-sm text-ink/60">
                {safeLocale === "ar" ? "الكمية" : "Quantite"}: {rentalRequest.quantity || 1} • {safeLocale === "ar" ? "المدة" : "Duree"}: {rentalRequest.durationDays || 1}
              </p>
              <p className="mt-2 text-sm text-ink/60">
                {[rentalRequest.renter?.name, rentalRequest.rentalItem?.title].filter(Boolean).join(" • ") || "-"}
              </p>
              <p className="mt-2 text-sm font-semibold text-clay">{safeLocale === "ar" ? "الإجمالي" : "Total"}: {rentalRequest.totalPrice || 0} DH</p>
              {rentalRequest.notes ? <p className="mt-2 text-sm text-ink/70">{rentalRequest.notes}</p> : null}
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-ink/45">
                {formatLocaleDateTime(rentalRequest.createdAt, safeLocale)}
              </p>
              <div className="mt-4">
                <AgencyStatusActions
                  endpoint="/api/rental-requests"
                  idField="rentalRequestId"
                  itemId={rentalRequest._id}
                  status={rentalRequest.status || "pending"}
                  allowedStatuses={["pending", "approved", "delivered", "returned"]}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-ink/60">{siteCopy[safeLocale].noMessages}</p>
      )}
    </section>
  );
}

export function AgencyLeadsSection({
  leads,
  conversations,
  locale = "ar"
}: {
  leads: any[];
  conversations: any[];
  locale?: SiteLocale;
}) {
  const safeLocale = resolveLocale(locale);
  const copy = siteCopy[safeLocale];
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-[2rem] bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-ink">{copy.leads}</h2>
          <span className="text-sm text-ink/60">{copy.travelSide}</span>
        </div>
        <div className="mt-6 space-y-4">
          {leads.length > 0 ? (
            leads.map((lead: any) => (
              <div key={lead._id} className="rounded-[1.5rem] border border-ink/10 p-4">
                <div className="flex items-start justify-between gap-4">
                  <p className="font-semibold text-ink">{copy.leads}: {lead.type}</p>
                  <span className="rounded-full bg-sand px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-ink/60">
                    {getLeadStatusLabel(lead.status, safeLocale)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink/60">{formatLocaleDateTime(lead.createdAt, safeLocale)}</p>
                <div className="mt-4">
                  <AgencyStatusActions
                    endpoint="/api/leads"
                    idField="leadId"
                    itemId={lead._id}
                    status={lead.status || "new"}
                    allowedStatuses={["new", "contacted", "closed"]}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-ink/60">{copy.noMessages}</p>
          )}
        </div>
      </div>

      <div className="rounded-[2rem] bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-ink">{copy.messages}</h2>
          <span className="text-sm text-ink/60">{copy.inboxBody}</span>
        </div>
        <div className="mt-6 space-y-4">
          {conversations.length > 0 ? (
            conversations.map((conversation: any) => (
              <Link key={conversation._id} href={withLocale(`/messages/${conversation._id}`, safeLocale)} className="block rounded-[1.5rem] border border-ink/10 p-4">
                <p className="font-semibold text-ink">{conversation.listing?.title || copy.conversation}</p>
                <p className="mt-2 text-sm text-ink/60">
                  {formatLocaleDateTime(conversation.lastMessageAt, safeLocale)}
                </p>
              </Link>
            ))
          ) : (
            <p className="text-sm text-ink/60">{copy.noMessages}</p>
          )}
        </div>
      </div>
    </section>
  );
}
