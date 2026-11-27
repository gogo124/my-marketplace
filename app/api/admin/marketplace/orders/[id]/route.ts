import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import ResellingOrder from "@/models/ResellingOrder";
type Context={params:Promise<{id:string}>};
const statuses=["pending","confirmed","processing","shipped","delivered","cancelled","customer_unreachable"];
export async function PATCH(request:Request,context:Context){const auth=await getAdminApiSession();if(auth.error)return auth.error;const {id}=await context.params;const body=await request.json();if(!statuses.includes(body.status))return NextResponse.json({error:"Invalid order status."},{status:400});await connectToDatabase();const order=await ResellingOrder.findByIdAndUpdate(id,{status:body.status, ...(typeof body.internalNote==="string"?{internalNote:body.internalNote.slice(0,1000)}:{})},{new:true,runValidators:true});if(!order)return NextResponse.json({error:"Order not found."},{status:404});return NextResponse.json({order})}
