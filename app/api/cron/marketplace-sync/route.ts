import { NextResponse } from "next/server";
import { syncDueImportedProducts } from "@/lib/marketplace-importer";
export const runtime="nodejs";export const maxDuration=300;
function authorized(request:Request){const secret=process.env.CRON_SECRET;if(!secret)return false;const authorization=request.headers.get("authorization");const headerSecret=request.headers.get("x-cron-secret");return authorization===`Bearer ${secret}`||headerSecret===secret;}
export async function GET(request:Request){if(!authorized(request))return NextResponse.json({error:"Unauthorized."},{status:401});try{const results=await syncDueImportedProducts(Number(process.env.MARKETPLACE_SYNC_BATCH_SIZE||10));return NextResponse.json({ok:true,processed:results.length,results});}catch{return NextResponse.json({error:"Marketplace synchronization failed."},{status:500});}}
