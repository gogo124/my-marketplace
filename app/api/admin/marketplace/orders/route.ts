import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import ResellingOrder from "@/models/ResellingOrder";
export async function GET(){const auth=await getAdminApiSession();if(auth.error)return auth.error;await connectToDatabase();return NextResponse.json(await ResellingOrder.find({}).sort({createdAt:-1}).lean())}
