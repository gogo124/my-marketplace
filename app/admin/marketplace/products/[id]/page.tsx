import { MarketplaceProductManager } from "@/components/marketplace-product-manager";
import { MarketplaceSourceSyncPanel } from "@/components/marketplace-source-sync-panel";
import { getResellingProductsForAdmin } from "@/lib/reselling-marketplace";
export const dynamic="force-dynamic";
export default async function EditPage({params}:{params:Promise<{id:string}>}){const{id}=await params;const products=await getResellingProductsForAdmin();const product=products.find(p=>String(p._id)===id);if(!product)return <main><p>Product not found.</p></main>;return <main className="space-y-6"><div><h1 className="text-3xl font-black">Edit Product</h1><p className="mt-1 text-sm text-slate-500">Supplier-controlled fields and MoroccanTrip-controlled fields are kept separate.</p></div><MarketplaceSourceSyncPanel product={product}/><MarketplaceProductManager initial={product} editingId={id}/></main>}
