import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import { validateHeroSlidePayload } from "@/lib/hero-slides";
import HeroSlide from "@/models/HeroSlide";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminApiSession();
  if ("error" in admin) return admin.error;
  try {
    const { id } = await params;
    const validation = validateHeroSlidePayload(await request.json());
    if ("error" in validation) return NextResponse.json({ error: validation.error }, { status: 400 });
    await connectToDatabase();
    const slide = await HeroSlide.findByIdAndUpdate(id, validation.data, { new: true, runValidators: true });
    if (!slide) return NextResponse.json({ error: "Hero slide not found." }, { status: 404 });
    return NextResponse.json({ slide });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update hero slide." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminApiSession();
  if ("error" in admin) return admin.error;
  try {
    await connectToDatabase();
    const { id } = await params;
    const deleted = await HeroSlide.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Hero slide not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not delete hero slide." }, { status: 500 });
  }
}
