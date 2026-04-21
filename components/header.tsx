import { getAuthSession } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";

export async function Header() {
  const session = await getAuthSession();

  return <SiteHeader session={session} />;
}
