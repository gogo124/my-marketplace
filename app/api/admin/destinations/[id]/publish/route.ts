import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import Destination from "@/models/Destination";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){const admin=await getAdminApiSession();if("error" in admin)return admin.error;try{await connectToDatabase();const {id}=await params;const body=await request.json();const destination=await Destination.findByIdAndUpdate(id,{published:Boolean(body.published)},{new:true});if(!destination)return NextResponse.json({error:"Destination not found."},{status:404});return NextResponse.json({destination});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Could not update destination status."},{status:500});}}
