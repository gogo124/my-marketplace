import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { importActivityFromUrl } from "@/lib/activity-import";

export async function POST(request: Request) {
  const admin = await getAdminApiSession();
  if ("error" in admin) return admin.error;
  try {
    const body = await request.json();
    const sourceUrl = typeof body?.sourceUrl === "string" ? body.sourceUrl.trim() : "";
    if (!sourceUrl) return NextResponse.json({ error: "Enter an activity URL." }, { status: 400 });
    return NextResponse.json({ activity: await importActivityFromUrl(sourceUrl) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not import activity." }, { status: 400 });
  }
}
