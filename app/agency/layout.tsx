import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AgencyOwnerSidebar } from "@/components/agency-owner-sidebar";
import { getAuthSession } from "@/lib/auth";
import { getAgencyProfileByUserId } from "@/lib/agency";
import { resolveLocale, withLocale } from "@/lib/i18n";
import { getSessionUser, getUserPermissions } from "@/lib/permissions";

export default async function AgencyOwnerLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAuthSession();
  const requestHeaders = await headers();
  const locale = resolveLocale(requestHeaders.get("x-site-locale") || undefined);

  if (!session?.user?.id) {
    redirect(withLocale("/login", locale));
  }

  const profile = await getAgencyProfileByUserId(session.user.id);
  const user = getSessionUser(session);
  const permissions = getUserPermissions(user, { hasAgencyProfile: Boolean(profile?._id) });

  if (!permissions.canOpenAgencyProfile) {
    redirect(withLocale("/", locale));
  }

  return (
    <main className="page-shell grid gap-8 lg:grid-cols-[260px_1fr]">
      <AgencyOwnerSidebar
        isAgency={permissions.canAccessAgencyWorkspace}
        canCreateAgency={permissions.canOpenAgencyProfile}
        publicProfileId={profile?._id}
      />
      <div className="space-y-8">{children}</div>
    </main>
  );
}
