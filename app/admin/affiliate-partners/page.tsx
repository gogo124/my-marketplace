import { AffiliatePartnerManager } from "@/components/affiliate-partner-manager";
import { getAffiliatePartnersForAdmin } from "@/lib/affiliate-partners";
export const dynamic = "force-dynamic";
export default async function AdminAffiliatePartnersPage() { return <AffiliatePartnerManager partners={await getAffiliatePartnersForAdmin() as any[]} />; }
