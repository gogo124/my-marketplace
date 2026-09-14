import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import ResellingProduct from "@/models/ResellingProduct";
import { validateResellingProductPayload } from "@/lib/reselling-marketplace";
export async function GET(){const auth=await getAdminApiSession();if(auth.error)return auth.error;await connectToDatabase();const items=await ResellingProduct.find({}).sort({createdAt:-1}).lean();return NextResponse.json(items)}
export async function POST(request:Request){const auth=await getAdminApiSession();if(auth.error)return auth.error;const body=await request.json();const valid=validateResellingProductPayload(body);if("error" in valid)return NextResponse.json({error:valid.error},{status:400});await connectToDatabase();const product=await ResellingProduct.create(valid.data);return NextResponse.json({product},{status:201})}
