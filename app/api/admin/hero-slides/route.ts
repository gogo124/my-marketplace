import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import { getHeroSlidesForAdmin, validateHeroSlidePayload } from "@/lib/hero-slides";
import HeroSlide from "@/models/HeroSlide";

export async function GET() {
  const admin = await getAdminApiSession();
  if ("error" in admin) return admin.error;
  return NextResponse.json({ slides: await getHeroSlidesForAdmin() });
}

export async function POST(request: Request) {
  const admin = await getAdminApiSession();
  if ("error" in admin) return admin.error;
  try {
    const validation = validateHeroSlidePayload(await request.json());
    if ("error" in validation) return NextResponse.json({ error: validation.error }, { status: 400 });
    await connectToDatabase();
    return NextResponse.json({ slide: await HeroSlide.create(validation.data) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create hero slide." }, { status: 500 });
  }
}
