import Link from "next/link";
import { getAdminPageSession } from "@/lib/admin";
import { MarketplaceProductImporter } from "@/components/marketplace-product-importer";
import { MarketplaceImportedProducts } from "@/components/marketplace-imported-products";
import { getResellingProductsForAdmin } from "@/lib/reselling-marketplace";
export const dynamic="force-dynamic";
export default async function MarketplaceProductImportPage(){await getAdminPageSession();const products=(await getResellingProductsForAdmin()).filter((product:any)=>product.sourceSync?.enabled);return <main className="page-shell space-y-6 pb-20"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.25em] text-clay">Marketplace</p><h1 className="mt-2 text-4xl font-black">Product importer</h1></div><Link href="/admin/marketplace/products" className="rounded-full border border-ink/10 px-4 py-2 text-sm font-black">Product manager</Link></div><MarketplaceProductImporter/><MarketplaceImportedProducts products={products}/></main>}
