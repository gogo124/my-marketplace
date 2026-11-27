import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { parseSupplierUrl } from "@/lib/reselling-marketplace";
export async function POST(request:Request){const auth=await getAdminApiSession();if(auth.error)return auth.error;const result=parseSupplierUrl((await request.json()).url);if("error" in result)return NextResponse.json({error:result.error},{status:400});return NextResponse.json(result)}
