import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { getAgencyProfileByUserId } from "@/lib/agency";
import { resolveLocale, withLocale } from "@/lib/i18n";
import { getSessionUser, getUserPermissions } from "@/lib/permissions";

export default async function AgencyIndexPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang);
  const session = await getAuthSession().catch(() => null);

  if (!session?.user?.id) {
    redirect(withLocale("/agencies", locale));
  }

  const profile = await getAgencyProfileByUserId(session.user.id).catch(() => null);
  const permissions = getUserPermissions(getSessionUser(session), { hasAgencyProfile: Boolean(profile?._id) });

  if (permissions.canAccessAgencyWorkspace) {
    redirect(withLocale("/agency/dashboard", locale));
  }

  if (permissions.canOpenAgencyProfile) {
    redirect(withLocale("/agency/profile", locale));
  }

  redirect(withLocale("/agencies", locale));
}
