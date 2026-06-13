import { AffiliateProductManager } from "@/components/affiliate-product-manager";
import { getAffiliateProductsForAdmin } from "@/lib/affiliate-products";

export const dynamic = "force-dynamic";

export default async function AdminAffiliateProductsPage() {
  const products = await getAffiliateProductsForAdmin();
  return <AffiliateProductManager products={products as any[]} />;
}
