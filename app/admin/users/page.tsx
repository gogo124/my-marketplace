import { AdminMutationButton } from "@/components/admin-mutation-button";
import { AdminSellerControls } from "@/components/admin-seller-controls";
import { StatusBadge } from "@/components/status-badge";
import { getAdminUsers } from "@/lib/admin";
import { getSellerVerificationLabel } from "@/lib/trust";

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: Promise<{ role?: string; accountStatus?: string }>;
}) {
  const { role = "", accountStatus = "" } = await searchParams;
  const users = await getAdminUsers({ role: role || undefined, accountStatus: accountStatus || undefined });

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-6 shadow-card">
        <h1 className="text-3xl font-black text-ink">Users</h1>
        <p className="mt-3 text-sm text-ink/60">Review registered users, roles, and seller verification status.</p>
        <form className="mt-4 flex flex-wrap gap-3">
          <select name="role" defaultValue={role} className="rounded-xl border border-ink/10 px-4 py-2 text-sm">
            <option value="">All roles</option>
            <option value="user">User</option>
            <option value="agency">Agency</option>
            <option value="renter">Renter</option>
            <option value="admin">Admin</option>
          </select>
          <select name="accountStatus" defaultValue={accountStatus} className="rounded-xl border border-ink/10 px-4 py-2 text-sm">
            <option value="">All accounts</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
          <button className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white">Filter</button>
        </form>
      </section>

      <section className="grid gap-4">
        {users.length > 0 ? users.map((user: any) => (
          (() => {
            const sellerStatus =
              user.sellerVerificationStatus || (user.verified ? "verified" : "unverified");

            return (
          <article key={user._id} className="rounded-[2rem] bg-white p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-ink">{user.name || "User"}</h2>
                <p className="mt-2 text-sm text-ink/60">{user.email}</p>
                <p className="mt-2 text-sm text-ink/60">Role: {user.role}</p>
                <div className="mt-2"><StatusBadge kind="account" status={user.accountStatus} locale="fr" /></div>
                <p className="mt-2 text-sm text-ink/60">
                  Seller verification: {getSellerVerificationLabel(sellerStatus, "fr")}
                </p>
                <p className="mt-2 text-sm text-ink/60">
                  Seller access: {user.sellerStatus || "none"}
                </p>
                <p className="mt-2 text-sm text-ink/60">
                  Activity provider: {user.activityProviderStatus || "none"}
                </p>
                <p className="mt-2 text-sm text-ink/60">
                  Seller plan: {user.sellerPlan || "-"}
                </p>
                <p className="mt-2 text-sm text-ink/60">
                  Seller expires: {user.sellerExpiresAt ? new Date(user.sellerExpiresAt).toLocaleString() : "-"}
                </p>
                {user.sellerProfile?.businessName ? (
                  <div className="mt-3 rounded-[1.25rem] border border-ink/10 bg-sand/20 p-4 text-sm text-ink/70">
                    <p><strong>Store:</strong> {user.sellerProfile.businessName}</p>
                    <p><strong>City:</strong> {user.sellerProfile.city || "-"}</p>
                    <p><strong>Phone:</strong> {user.sellerProfile.phone || "-"}</p>
                    <p><strong>WhatsApp:</strong> {user.sellerProfile.whatsapp || "-"}</p>
                    <p><strong>Instagram:</strong> {user.sellerProfile.instagram || "-"}</p>
                    <p><strong>Facebook:</strong> {user.sellerProfile.facebook || "-"}</p>
                    <p><strong>Description:</strong> {user.sellerProfile.description || "-"}</p>
                    <p><strong>Products:</strong> {user.sellerProfile.whatTheySell || "-"}</p>
                  </div>
                ) : null}
                <p className="mt-2 text-sm text-ink/60">
                  Can create agency: {user.canCreateAgency ? "Yes" : "No"}
                </p>
                <p className="mt-2 text-sm text-ink/60">
                  Can create renter: {user.canCreateRenter ? "Yes" : "No"}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-ink/45">
                  Joined {new Date(user.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="w-full">
                  <AdminSellerControls
                    userId={user._id}
                    sellerStatus={user.sellerStatus}
                    sellerPlan={user.sellerPlan}
                    sellerExpiresAt={user.sellerExpiresAt}
                  />
                </div>
                {sellerStatus !== "verified" ? (
                  <AdminMutationButton
                    endpoint={`/api/admin/users/${user._id}`}
                    body={{ sellerVerificationStatus: "verified" }}
                    label="Verify seller"
                  />
                ) : (
                  <AdminMutationButton
                    endpoint={`/api/admin/users/${user._id}`}
                    body={{ sellerVerificationStatus: "unverified" }}
                    label="Remove verification"
                    variant="neutral"
                  />
                )}
                <AdminMutationButton
                  endpoint={`/api/admin/users/${user._id}`}
                  body={{ role: "user" }}
                  label="Set user role"
                  variant={user.role === "user" ? "neutral" : undefined}
                />
                <AdminMutationButton
                  endpoint={`/api/admin/users/${user._id}`}
                  body={{ role: "agency" }}
                  label="Set agency role"
                  variant={user.role === "agency" ? "neutral" : undefined}
                />
                <AdminMutationButton
                  endpoint={`/api/admin/users/${user._id}`}
                  body={{ role: "renter" }}
                  label="Set renter role"
                  variant={user.role === "renter" ? "neutral" : undefined}
                />
                <AdminMutationButton
                  endpoint={`/api/admin/users/${user._id}`}
                  body={{ role: "admin" }}
                  label="Set admin role"
                  variant={user.role === "admin" ? "neutral" : undefined}
                />
                <AdminMutationButton
                  endpoint={`/api/admin/users/${user._id}`}
                  body={{ canCreateAgency: !user.canCreateAgency }}
                  label={user.canCreateAgency ? "Disable agency creation" : "Allow agency creation"}
                  variant={user.canCreateAgency ? "neutral" : undefined}
                />
                <AdminMutationButton
                  endpoint={`/api/admin/users/${user._id}`}
                  body={{ canCreateRenter: !user.canCreateRenter }}
                  label={user.canCreateRenter ? "Disable renter creation" : "Allow renter creation"}
                  variant={user.canCreateRenter ? "neutral" : undefined}
                />
                <AdminMutationButton
                  endpoint={`/api/admin/users/${user._id}`}
                  body={{ activityProviderStatus: "active" }}
                  label="Activate activity provider"
                />
                <AdminMutationButton
                  endpoint={`/api/admin/users/${user._id}`}
                  body={{ activityProviderStatus: "rejected" }}
                  label="Reject activity provider"
                  variant="neutral"
                />
                <AdminMutationButton
                  endpoint={`/api/admin/users/${user._id}`}
                  body={{ accountStatus: user.accountStatus === "disabled" ? "active" : "disabled" }}
                  label={user.accountStatus === "disabled" ? "Enable account" : "Disable account"}
                  variant={user.accountStatus === "disabled" ? "neutral" : "danger"}
                />
                <AdminMutationButton
                  endpoint={`/api/admin/users/${user._id}`}
                  method="DELETE"
                  label="Delete user"
                  variant="danger"
                  confirmText="Delete this user and related content?"
                />
              </div>
            </div>
          </article>
            );
          })()
        )) : (
          <section className="rounded-[2rem] bg-white p-8 text-sm text-ink/60 shadow-card">
            No users match this filter.
          </section>
        )}
      </section>
    </div>
  );
}
