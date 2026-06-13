import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { getPlacesForAdmin, validatePlacePayload } from "@/lib/camping";
import { connectToDatabase } from "@/lib/db";
import Place from "@/models/Place";

export async function GET() { const admin = await getAdminApiSession(); if ("error" in admin) return admin.error; return NextResponse.json({ places: await getPlacesForAdmin() }); }
export async function POST(request: Request) { const admin = await getAdminApiSession(); if ("error" in admin) return admin.error; const validation = validatePlacePayload(await request.json()); if ("error" in validation) return NextResponse.json({ error: validation.error, fields: validation.fields }, { status: 400 }); await connectToDatabase(); if (await Place.exists({ slug: validation.data.slug })) return NextResponse.json({ error: "Slug already used", fields: { slug: "This slug is already used by another camping place." } }, { status: 409 }); return NextResponse.json({ place: await Place.create(validation.data) }, { status: 201 }); }
