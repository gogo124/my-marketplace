import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { validateAffiliatePartnerPayload } from "@/lib/affiliate-partners";
import { connectToDatabase } from "@/lib/db";
import AffiliatePartner from "@/models/AffiliatePartner";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, context: Context) { const admin = await getAdminApiSession(); if ("error" in admin) return admin.error; const validation = validateAffiliatePartnerPayload(await request.json()); if ("error" in validation) return NextResponse.json({ error: validation.error }, { status: 400 }); await connectToDatabase(); const { id } = await context.params; const partner = await AffiliatePartner.findByIdAndUpdate(id, validation.data, { new: true, runValidators: true }); if (!partner) return NextResponse.json({ error: "Affiliate partner not found." }, { status: 404 }); return NextResponse.json({ partner }); }
export async function DELETE(_request: Request, context: Context) { const admin = await getAdminApiSession(); if ("error" in admin) return admin.error; await connectToDatabase(); const { id } = await context.params; const partner = await AffiliatePartner.findByIdAndDelete(id); if (!partner) return NextResponse.json({ error: "Affiliate partner not found." }, { status: 404 }); return NextResponse.json({ success: true }); }
