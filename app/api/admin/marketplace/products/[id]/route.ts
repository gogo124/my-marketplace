import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import ResellingProduct from "@/models/ResellingProduct";
import { validateResellingProductPayload } from "@/lib/reselling-marketplace";
type Context={params:Promise<{id:string}>};
export async function PATCH(request:Request,context:Context){const auth=await getAdminApiSession();if(auth.error)return auth.error;const {id}=await context.params;const valid=validateResellingProductPayload(await request.json());if("error" in valid)return NextResponse.json({error:valid.error},{status:400});await connectToDatabase();const product=await ResellingProduct.findByIdAndUpdate(id,valid.data,{new:true,runValidators:true});if(!product)return NextResponse.json({error:"Product not found."},{status:404});return NextResponse.json({product})}
export async function DELETE(_:Request,context:Context){const auth=await getAdminApiSession();if(auth.error)return auth.error;const {id}=await context.params;await connectToDatabase();const product=await ResellingProduct.findByIdAndUpdate(id,{status:"archived"},{new:true});if(!product)return NextResponse.json({error:"Product not found."},{status:404});return NextResponse.json({ok:true})}
