import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { extractJumiaProduct, importProductFromUrl, validateSupplierUrl } from "@/lib/marketplace-importer";
import ResellingProduct from "@/models/ResellingProduct";
import { connectToDatabase } from "@/lib/db";

export async function POST(request:Request){
  const admin=await getAdminApiSession();
  if("error" in admin)return admin.error;
  try{
    const body=await request.json();
    const url=validateSupplierUrl(String(body?.url||""));
    if(body?.action==="create"){
      const result=await importProductFromUrl(url);
      return NextResponse.json(result,{status:result.duplicate?409:201});
    }
    const product=await extractJumiaProduct(url);
    await connectToDatabase();
    const existing=product.sourceProductId?await ResellingProduct.findOne({"sourceSync.enabled":true,"sourceSync.supplier":product.supplier,"sourceSync.sourceProductId":product.sourceProductId}).select("_id slug title").lean():await ResellingProduct.findOne({"sourceSync.enabled":true,"sourceSync.supplier":product.supplier,"sourceSync.canonicalUrl":product.canonicalUrl}).select("_id slug title").lean();
    return NextResponse.json({product,duplicate:Boolean(existing),existing});
  }catch(error){
    const message=error instanceof Error?error.message:"Could not import the source product.";
    if((error as any)?.code==="blocked")return NextResponse.json({error:"Jumia blocked automated server access. You can import this public product using Browser Import.",code:"blocked",browserImport:true},{status:422});
    const status=message.includes("supports Jumia")||message.includes("Jumia Morocco product URL")?400:422;
    return NextResponse.json({error:message},{status});
  }
}
