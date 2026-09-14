import { MarketplaceProductManager } from "@/components/marketplace-product-manager";
export const dynamic="force-dynamic";
export default async function ImportPage(){return <main className="space-y-6"><div><h1 className="text-3xl font-black">Import Product</h1><p className="mt-2 text-sm text-slate-500">Verify a supported supplier URL, then review and enter product data. No unauthorized scraping is performed.</p></div><MarketplaceProductManager/></main>}
