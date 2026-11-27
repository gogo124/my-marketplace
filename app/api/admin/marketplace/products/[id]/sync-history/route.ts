import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import MarketplaceSyncLog from "@/models/MarketplaceSyncLog";
import { serializeDocument } from "@/lib/utils";
export async function GET(_request:Request,context:{params:Promise<{id:string}>}){const admin=await getAdminApiSession();if("error" in admin)return admin.error;await connectToDatabase();const{id}=await context.params;const logs=await MarketplaceSyncLog.find({productId:id}).sort({timestamp:-1}).limit(100).lean();return NextResponse.json({logs:serializeDocument(logs)});}
