import { AdminMutationButton } from "@/components/admin-mutation-button";
import { getAdminUsers } from "@/lib/admin";

export default async function AdminActivityProvidersPage() {
  const users = await getAdminUsers();
  const providers = (users as any[]).filter((user) => user.activityProviderStatus && user.activityProviderStatus !== "none");

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <h1 className="text-3xl font-black text-ink">Activity Providers</h1>
        <p className="mt-3 text-sm text-ink/60">Approve, suspend, or reject activity provider access.</p>
      </section>
      <section className="grid gap-4">
        {providers.length > 0 ? providers.map((user: any) => (
          <article key={user._id} className="rounded-[2rem] bg-white p-6 shadow-card">
            <h2 className="text-xl font-bold text-ink">{user.activityProviderProfile?.businessName || user.name}</h2>
            <p className="mt-2 text-sm text-ink/60">{user.email}</p>
            <p className="mt-2 text-sm text-ink/60">Status: {user.activityProviderStatus}</p>
            <p className="mt-2 text-sm text-ink/60">City: {user.activityProviderProfile?.city || "-"}</p>
            <p className="mt-2 text-sm text-ink/60">Phone: {user.activityProviderProfile?.phone || "-"}</p>
            <p className="mt-2 text-sm text-ink/60">WhatsApp: {user.activityProviderProfile?.whatsapp || "-"}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <AdminMutationButton endpoint={`/api/admin/users/${user._id}`} body={{ activityProviderStatus: "active" }} label="Activate" />
              <AdminMutationButton endpoint={`/api/admin/users/${user._id}`} body={{ activityProviderStatus: "rejected" }} label="Reject" variant="neutral" />
              <AdminMutationButton endpoint={`/api/admin/users/${user._id}`} body={{ activityProviderStatus: "suspended" }} label="Suspend" variant="danger" />
            </div>
          </article>
        )) : (
          <section className="rounded-[2rem] bg-white p-8 text-sm text-ink/60 shadow-card">No activity provider requests yet.</section>
        )}
      </section>
    </div>
  );
}
