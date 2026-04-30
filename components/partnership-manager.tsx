"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getApiError, parseApiResponse } from "@/lib/api";
import { resolveLocale, SiteLocale, translateApiError } from "@/lib/i18n";

type PartnershipEntry = {
  _id: string;
  name?: string;
  city?: string;
  verificationStatus?: string;
  partnershipId?: string | null;
  partnershipStatus?: "none" | "pending" | "accepted" | "rejected";
  requestedByRole?: "agency" | "renter" | null;
};

type PartnershipManagerProps = {
  role: "agency" | "renter";
  directory: PartnershipEntry[];
  accepted: PartnershipEntry[];
  incomingRequests: PartnershipEntry[];
  outgoingRequests: PartnershipEntry[];
  currentRenterProfileId?: string;
  locale?: SiteLocale;
};

export function PartnershipManager({
  role,
  directory,
  accepted,
  incomingRequests,
  outgoingRequests,
  currentRenterProfileId,
  locale = "ar"
}: PartnershipManagerProps) {
  const router = useRouter();
  const safeLocale = resolveLocale(locale);
  const [loadingId, setLoadingId] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"error" | "success" | "info">("info");
  const rejected = directory.filter((entry) => entry.partnershipStatus === "rejected");

  const labels =
    safeLocale === "ar"
      ? {
          title: role === "agency" ? "شراكات مزودي الكراء" : "شراكات الوكالات",
          accepted: role === "agency" ? "الشركاء المقبولون" : "الوكالات المقبولة",
          incoming: "الطلبات الواردة",
          outgoing: "الطلبات المرسلة",
          rejected: "الشراكات المرفوضة",
          directory: role === "agency" ? "مزودو الكراء" : "الوكالات المتاحة",
          send: "إرسال طلب",
          resend: "إعادة الإرسال",
          accept: "قبول",
          reject: "رفض",
          pending: "قيد الانتظار",
          acceptedStatus: "مقبول",
          rejectedStatus: "مرفوض",
          none: "لا توجد شراكات حتى الآن.",
          city: "المدينة",
          verified: "الحالة",
          status: "حالة الشراكة"
        }
      : {
          title: role === "agency" ? "Partenariats loueurs" : "Partenariats agences",
          accepted: role === "agency" ? "Partenaires acceptes" : "Agences acceptees",
          incoming: "Demandes recues",
          outgoing: "Demandes envoyees",
          rejected: "Partenariats refuses",
          directory: role === "agency" ? "Loueurs disponibles" : "Agences disponibles",
          send: "Envoyer",
          resend: "Renvoyer",
          accept: "Accepter",
          reject: "Refuser",
          pending: "En attente",
          acceptedStatus: "Accepte",
          rejectedStatus: "Refuse",
          none: "Aucun partenariat pour le moment.",
          city: "Ville",
          verified: "Statut",
          status: "Etat du partenariat"
        };

  function renderStatusBadge(status: PartnershipEntry["partnershipStatus"]) {
    if (status === "accepted") {
      return <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{labels.acceptedStatus}</span>;
    }

    if (status === "rejected") {
      return <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">{labels.rejectedStatus}</span>;
    }

    if (status === "pending") {
      return <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{labels.pending}</span>;
    }

    return null;
  }

  async function sendRequest(targetId: string) {
    setLoadingId(targetId);
    setMessage("");

    try {
      const body =
        role === "renter"
          ? {
              agencyId: targetId,
              renterProfileId: currentRenterProfileId
            }
          : { targetId };

      if (role === "renter" && !currentRenterProfileId) {
        throw new Error(locale === "ar" ? "ملف الكراء غير متاح." : "Rental profile unavailable.");
      }

      const response = await fetch("/api/partnerships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not send partnership request."), safeLocale));
      }

      const status = (data as any)?.partnership?.status as PartnershipEntry["partnershipStatus"];
      setMessage(
        status === "pending"
          ? locale === "ar"
            ? "طلب الشراكة قيد الانتظار."
            : "Partnership request is pending."
          : status === "accepted"
            ? locale === "ar"
              ? "الشراكة مقبولة بالفعل."
              : "Partnership is already accepted."
            : status === "rejected"
              ? locale === "ar"
                ? "تم رفض هذه الشراكة."
                : "This partnership was rejected."
              : locale === "ar"
                ? "تم حفظ حالة الشراكة."
                : "Partnership status updated."
      );
      setMessageTone("success");
      router.refresh();
    } catch (requestError) {
      setMessage(
        requestError instanceof Error ? requestError.message : translateApiError("Unexpected error.", safeLocale)
      );
      setMessageTone("error");
    } finally {
      setLoadingId("");
    }
  }

  async function updateRequest(partnershipId: string, status: "accepted" | "rejected") {
    setLoadingId(partnershipId);
    setMessage("");

    try {
      const response = await fetch("/api/partnerships", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnershipId, status })
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(translateApiError(getApiError(data, "Could not update partnership request."), safeLocale));
      }

      setMessage(
        locale === "ar"
          ? status === "accepted"
            ? "تم قبول الطلب."
            : "تم رفض الطلب."
          : status === "accepted"
            ? "Request accepted."
            : "Request rejected."
      );
      setMessageTone("success");
      router.refresh();
    } catch (requestError) {
      setMessage(
        requestError instanceof Error ? requestError.message : translateApiError("Unexpected error.", safeLocale)
      );
      setMessageTone("error");
    } finally {
      setLoadingId("");
    }
  }

  return (
    <section className="space-y-6 rounded-[2rem] bg-white p-6 shadow-card">
      <div>
        <h2 className="text-2xl font-black text-ink">{labels.title}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{accepted.length} {labels.acceptedStatus}</span>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{incomingRequests.length + outgoingRequests.length} {labels.pending}</span>
          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">{rejected.length} {labels.rejectedStatus}</span>
        </div>
        {message ? (
          <p className={`mt-3 text-sm font-medium ${messageTone === "error" ? "text-red-600" : messageTone === "success" ? "text-emerald-600" : "text-ink/60"}`}>
            {message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-3 rounded-[1.5rem] border border-ink/10 p-4">
          <h3 className="text-lg font-bold text-ink">{labels.accepted}</h3>
          {accepted.length > 0 ? (
            accepted.map((entry) => (
              <div key={`accepted-${entry._id}`} className="rounded-[1.25rem] bg-sand p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{entry.name || "-"}</p>
                    <p className="mt-1 text-sm text-ink/60">{labels.city}: {entry.city || "-"}</p>
                  </div>
                  {renderStatusBadge("accepted")}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-ink/60">{labels.none}</p>
          )}
        </div>

        <div className="space-y-3 rounded-[1.5rem] border border-ink/10 p-4">
          <h3 className="text-lg font-bold text-ink">{labels.incoming}</h3>
          {incomingRequests.length > 0 ? (
            incomingRequests.map((entry) => (
              <div key={`incoming-${entry._id}`} className="rounded-[1.25rem] bg-sand p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{entry.name || "-"}</p>
                    <p className="mt-1 text-sm text-ink/60">{labels.city}: {entry.city || "-"}</p>
                  </div>
                  {renderStatusBadge("pending")}
                </div>
                {role === "agency" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (entry.partnershipId) {
                          void updateRequest(entry.partnershipId, "accepted");
                        }
                      }}
                      disabled={!entry.partnershipId || loadingId === entry.partnershipId}
                      className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {labels.accept}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (entry.partnershipId) {
                          void updateRequest(entry.partnershipId, "rejected");
                        }
                      }}
                      disabled={!entry.partnershipId || loadingId === entry.partnershipId}
                      className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink disabled:opacity-60"
                    >
                      {labels.reject}
                    </button>
                  </div>
                ) : (
                  <p className="mt-3 text-sm font-semibold text-clay">{labels.pending}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-ink/60">{labels.none}</p>
          )}
        </div>

        <div className="space-y-3 rounded-[1.5rem] border border-ink/10 p-4">
          <h3 className="text-lg font-bold text-ink">{labels.outgoing}</h3>
          {outgoingRequests.length > 0 ? (
            outgoingRequests.map((entry) => (
              <div key={`outgoing-${entry._id}`} className="rounded-[1.25rem] bg-sand p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{entry.name || "-"}</p>
                    <p className="mt-1 text-sm text-ink/60">{labels.city}: {entry.city || "-"}</p>
                  </div>
                  {renderStatusBadge("pending")}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-ink/60">{labels.none}</p>
          )}
        </div>
      </div>

      <div className="space-y-3 rounded-[1.5rem] border border-ink/10 p-4">
        <h3 className="text-lg font-bold text-ink">{labels.rejected}</h3>
        {rejected.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {rejected.map((entry) => (
              <div key={`rejected-${entry._id}`} className="rounded-[1.25rem] bg-rose-50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{entry.name || "-"}</p>
                    <p className="mt-1 text-sm text-ink/60">{labels.city}: {entry.city || "-"}</p>
                  </div>
                  {renderStatusBadge("rejected")}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink/60">{labels.none}</p>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-bold text-ink">{labels.directory}</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {directory.map((entry) => {
            const isBusy = loadingId === entry._id;
            const isRenter = role === "renter";
            const showSendButton = isRenter
              ? entry.partnershipStatus === "none"
              : entry.partnershipStatus === "none" || entry.partnershipStatus === "rejected";

            return (
              <div key={entry._id} className="rounded-[1.25rem] border border-ink/10 p-4">
                <p className="font-semibold text-ink">{entry.name || "-"}</p>
                <p className="mt-1 text-sm text-ink/60">{labels.city}: {entry.city || "-"}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-ink/45">
                  {labels.verified}: {entry.verificationStatus || "-"}
                </p>
                {entry.partnershipStatus !== "none" ? (
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-ink/45">{labels.status}</p>
                    {renderStatusBadge(entry.partnershipStatus)}
                  </div>
                ) : null}
                <div className="mt-4">
                  {showSendButton ? (
                    <button
                      type="button"
                      onClick={() => {
                        void sendRequest(entry._id);
                      }}
                      disabled={isBusy}
                      className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {isRenter ? labels.send : entry.partnershipStatus === "rejected" ? labels.resend : labels.send}
                    </button>
                  ) : (
                    renderStatusBadge(entry.partnershipStatus)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
