import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import ResellingProduct from "@/models/ResellingProduct";
import { importBrowserProduct, previewBrowserProduct, validateSupplierUrl } from "@/lib/marketplace-importer";

const MAX_BODY_BYTES=160_000;

export async function POST(request:Request){
  const admin=await getAdminApiSession();
  if("error" in admin)return admin.error;
  const length=Number(request.headers.get("content-length")||0);
  if(Number.isFinite(length)&&length>MAX_BODY_BYTES)return NextResponse.json({error:"Browser import payload is too large."},{status:413});
  try{
    const body=await request.json();
    if(String(body?.supplier||"").toLowerCase()!=="jumia")return NextResponse.json({error:"This browser importer only supports Jumia."},{status:400});
    const sourceUrl=validateSupplierUrl(String(body?.sourceUrl||""));
    const product=body?.product;
    if(!product||typeof product!=="object")return NextResponse.json({error:"Browser product data is required."},{status:400});
    if(JSON.stringify(product).length>MAX_BODY_BYTES)return NextResponse.json({error:"Browser import payload is too large."},{status:413});

    if(body?.action==="preview"){
      const result=await previewBrowserProduct(product,sourceUrl);
      return NextResponse.json(result,{status:result.duplicate?409:200});
    }

    // Browser extraction is the authoritative fallback when Jumia blocks server fetching.
    // If the product already exists, update its variants/source snapshot instead of
    // returning a duplicate that leaves the old, broken variant data in the database.
    await connectToDatabase();
    const preview=await previewBrowserProduct(product,sourceUrl);
    if(preview.duplicate&&preview.existing?._id){
      const next=preview.product;
      const storedVariants=Array.isArray(next.variants)?next.variants:[];
      if(!storedVariants.length)return NextResponse.json({error:"The browser importer did not find real variant combinations. Existing product was not changed."},{status:422});
      const existing=await ResellingProduct.findById(preview.existing._id);
      if(!existing)return NextResponse.json({error:"The existing product could not be found."},{status:404});
      const manualOverrides=new Set(existing.sourceSync?.manualOverrides||[]);
      const set:any={
        "sourceSync.variants":storedVariants,
        "sourceSync.sourcePrice":next.sourcePrice,
        "sourceSync.originalPrice":next.originalPrice,
        "sourceSync.currency":next.currency,
        "sourceSync.stockStatus":next.stockStatus,
        "sourceSync.stockQuantity":next.stockQuantity,
        "sourceSync.sourceUrl":next.sourceUrl,
        "sourceSync.canonicalUrl":next.canonicalUrl,
        "sourceSync.sourceProductId":next.sourceProductId,
        "sourceSync.sourceHash":next.sourceHash,
        "sourceSync.lastSyncAttemptAt":new Date(),
        "sourceSync.lastSuccessfulSyncAt":new Date(),
        "sourceSync.lastSyncStatus":"synced",
        "sourceSync.lastSyncError":"",
      };
      if(!manualOverrides.has("variants"))set.variants=storedVariants;
      if(!manualOverrides.has("sellingPrice")&&next.sourcePrice!=null){
        const margin=Number(existing.sourceSync?.marginPercent??existing.marginValue??30);
        if(existing.sourceSync?.pricingMode!=="manual")set.sellingPrice=Math.max(0,Math.round(Number(next.sourcePrice)*(1+margin/100)*100)/100);
      }
      await ResellingProduct.updateOne({_id:existing._id},{$set:set});
      return NextResponse.json({duplicate:false,refreshed:true,existing,product:next},{status:200});
    }

    const result=await importBrowserProduct(product,sourceUrl);
    return NextResponse.json(result,{status:result.duplicate?409:201});
  }catch(error){
    const message=error instanceof Error?error.message:"Could not import the browser-collected product.";
    return NextResponse.json({error:message},{status:400});
  }
}
