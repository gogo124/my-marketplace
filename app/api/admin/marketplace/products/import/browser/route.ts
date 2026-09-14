import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
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
    const result=await importBrowserProduct(product,sourceUrl);
    return NextResponse.json(result,{status:result.duplicate?409:201});
  }catch(error){
    const message=error instanceof Error?error.message:"Could not import the browser-collected product.";
    return NextResponse.json({error:message},{status:400});
  }
}
