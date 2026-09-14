import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { syncImportedProduct } from "@/lib/marketplace-importer";
export async function POST(_request:Request,context:{params:Promise<{id:string}>}){const admin=await getAdminApiSession();if("error" in admin)return admin.error;try{const{id}=await context.params;const result=await syncImportedProduct(id);return NextResponse.json(result);}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Could not synchronize product."},{status:422});}}
