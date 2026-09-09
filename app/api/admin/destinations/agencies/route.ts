import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import AgencyProfile from "@/models/AgencyProfile";

export async function GET() {
  const admin = await getAdminApiSession();
  if ("error" in admin) return admin.error;

  await connectToDatabase();
  const agencies = await AgencyProfile.find({ verificationStatus: { $in: ["pending", "verified"] } })
    .select("name logo coverImage city description phone whatsapp verificationStatus")
    .sort({ name: 1 })
    .lean();

  return NextResponse.json({ agencies });
}
