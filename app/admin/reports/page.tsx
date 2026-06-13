import Link from "next/link";
import { AdminMutationButton } from "@/components/admin-mutation-button";
import { StatusBadge } from "@/components/status-badge";
import { getAdminReports } from "@/lib/admin";

export default async function AdminReportsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "" } = await searchParams;
  const reports = await getAdminReports(status || undefined);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <h1 className="text-3xl font-black text-ink">Reports</h1>
        <p className="mt-3 text-sm text-ink/60">
          Review user reports, inspect reported content, and take simple moderation actions.
        </p>
        <form className="mt-4 flex flex-wrap gap-3">
          <select name="status" defaultValue={status} className="rounded-xl border border-ink/10 px-4 py-2 text-sm">
            <option value="">All statuses</option>
            <option value="pending">Pending first</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
          </select>
          <button className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white">Filter</button>
        </form>
      </section>

      <section className="grid gap-4">
        {reports.length > 0 ? (
          reports.map((report: any) => (
            <article key={report._id} className="rounded-[2rem] bg-white p-6 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">{report.targetType}</p>
                    <StatusBadge kind="report" status={report.status} locale="fr" />
                  </div>
                  <h2 className="mt-2 text-xl font-bold text-ink">{report.reason}</h2>
                  <p className="mt-2 text-sm text-ink/60">
                    Reporter: {report.reporterId?.name || "User"} • {report.reporterId?.email || "-"}
                  </p>
                  <p className="mt-2 text-sm text-ink/60">
                    Target:{" "}
                    {report.target?.title ||
                      report.target?.name ||
                      report.target?.destination ||
                      report.target?.email ||
                      "Removed item"}
                  </p>
                  {report.description ? <p className="mt-3 text-sm leading-7 text-ink/70">{report.description}</p> : null}
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-ink/45">
                    {new Date(report.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href={report.href} className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-ink">
                    Open content
                  </Link>
                  {report.status !== "reviewed" ? (
                    <AdminMutationButton
                      endpoint={`/api/admin/reports/${report._id}`}
                      body={{ status: "reviewed" }}
                      label="Mark reviewed"
                      variant="neutral"
                    />
                  ) : null}
                  {report.status !== "resolved" ? (
                    <AdminMutationButton
                      endpoint={`/api/admin/reports/${report._id}`}
                      body={{ status: "resolved" }}
                      label="Resolve"
                    />
                  ) : null}
                  {report.targetType === "travel-post" ? (
                    <AdminMutationButton
                      endpoint={`/api/admin/travel-posts/${report.targetId}`}
                      method="DELETE"
                      label="Delete post"
                      variant="danger"
                      confirmText="Delete this reported travel post?"
                    />
                  ) : null}
                  {report.targetType === "user" ? (
                    <AdminMutationButton
                      endpoint={`/api/admin/users/${report.targetId}`}
                      body={{ accountStatus: "disabled" }}
                      label="Disable user"
                      variant="danger"
                      confirmText="Disable this reported user account?"
                    />
                  ) : null}
                  {report.targetType === "agency" ? (
                    <AdminMutationButton
                      endpoint={`/api/admin/agencies/${report.targetId}`}
                      body={{ verificationStatus: "unverified" }}
                      label="Unverify agency"
                      variant="neutral"
                    />
                  ) : null}
                  {report.targetType === "place" ? (
                    <>
                      <AdminMutationButton
                        endpoint={`/api/admin/places/${report.targetId}`}
                        body={{ status: "pending" }}
                        label="Move place to review"
                        variant="neutral"
                      />
                      <AdminMutationButton
                        endpoint={`/api/admin/places/${report.targetId}`}
                        method="DELETE"
                        label="Delete place"
                        variant="danger"
                        confirmText="Delete this reported place?"
                      />
                    </>
                  ) : null}

                  <AdminMutationButton
                    endpoint={`/api/admin/reports/${report._id}`}
                    method="DELETE"
                    label="Delete report"
                    variant="danger"
                    confirmText="Delete this report record?"
                  />
                </div>
              </div>
            </article>
          ))
        ) : (
          <section className="rounded-[2rem] bg-white p-8 text-sm text-ink/60 shadow-card">
            No reports yet.
          </section>
        )}
      </section>
    </div>
  );
}
