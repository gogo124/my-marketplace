import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { validatePlacePayload } from "@/lib/camping";
import { connectToDatabase } from "@/lib/db";
import Place from "@/models/Place";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, context: Context) { const admin = await getAdminApiSession(); if ("error" in admin) return admin.error; const validation = validatePlacePayload(await request.json()); if ("error" in validation) return NextResponse.json({ error: validation.error, fields: validation.fields }, { status: 400 }); await connectToDatabase(); const { id } = await context.params; if (await Place.exists({ slug: validation.data.slug, _id: { $ne: id } })) return NextResponse.json({ error: "Slug already used", fields: { slug: "This slug is already used by another camping place." } }, { status: 409 }); const place = await Place.findByIdAndUpdate(id, validation.data, { new: true, runValidators: true }); if (!place) return NextResponse.json({ error: "Camping place not found." }, { status: 404 }); return NextResponse.json({ place }); }
export async function DELETE(_request: Request, context: Context) { const admin = await getAdminApiSession(); if ("error" in admin) return admin.error; await connectToDatabase(); const { id } = await context.params; await Place.findByIdAndDelete(id); return NextResponse.json({ success: true }); }
