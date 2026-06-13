import { AffiliateActivityManager } from "@/components/affiliate-activity-manager"; import { getActivitiesForAdmin } from "@/lib/activity";
export const dynamic = "force-dynamic"; export default async function AdminActivitiesPage() { return <AffiliateActivityManager activities={await getActivitiesForAdmin()} />; }
