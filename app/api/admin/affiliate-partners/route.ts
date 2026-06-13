import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { getAffiliatePartnersForAdmin, validateAffiliatePartnerPayload } from "@/lib/affiliate-partners";
import AffiliatePartner from "@/models/AffiliatePartner";
import { connectToDatabase } from "@/lib/db";
export async function GET() { const admin = await getAdminApiSession(); if ("error" in admin) return admin.error; return NextResponse.json({ partners: await getAffiliatePartnersForAdmin() }); }
export async function POST(request: Request) { const admin = await getAdminApiSession(); if ("error" in admin) return admin.error; const validation = validateAffiliatePartnerPayload(await request.json()); if ("error" in validation) return NextResponse.json({ error: validation.error }, { status: 400 }); await connectToDatabase(); return NextResponse.json({ partner: await AffiliatePartner.create(validation.data) }, { status: 201 }); }
