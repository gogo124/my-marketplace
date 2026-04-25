import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RenterOwnerSidebar } from "@/components/renter-owner-sidebar";
import { getAuthSession } from "@/lib/auth";
import { resolveLocale, withLocale } from "@/lib/i18n";
import { getRenterWorkspaceRedirectPath, getSessionUser, getUserPermissions } from "@/lib/permissions";
import { getRenterProfileByUserId } from "@/lib/renter";

export default async function RenterOwnerLayout({
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

  const profile = await getRenterProfileByUserId(session.user.id);
  const user = getSessionUser(session);
  const permissions = getUserPermissions(user, { hasRenterProfile: Boolean(profile?._id) });
  const redirectPath = getRenterWorkspaceRedirectPath(user, locale, Boolean(profile?._id));

  if (redirectPath) {
    redirect(redirectPath);
  }

  return (
    <main className="page-shell grid gap-8 lg:grid-cols-[260px_1fr]">
      <RenterOwnerSidebar isRenter={permissions.canAccessRenterWorkspace} canCreateRenter={permissions.canOpenRenterProfile} />
      <div className="space-y-8">{children}</div>
    </main>
  );
}
