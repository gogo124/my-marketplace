import { getAdminPageSession } from "@/lib/admin";
import { getAffiliateWidgetsForAdmin } from "@/lib/affiliate-widgets";
import { getDestinationsForAdmin } from "@/lib/destinations";
import { AffiliateWidgetManager } from "@/components/affiliate-widget-manager";

export const dynamic = "force-dynamic";

export default async function AdminAffiliateWidgetsPage() {
  await getAdminPageSession();
  const [widgets, destinations] = await Promise.all([
    getAffiliateWidgetsForAdmin(),
    getDestinationsForAdmin(),
  ]);
  return <main className="page-shell pb-20"><AffiliateWidgetManager widgets={widgets as any[]} destinations={destinations as any[]} /></main>;
}
