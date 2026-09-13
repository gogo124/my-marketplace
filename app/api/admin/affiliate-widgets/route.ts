import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import AffiliateWidget from "@/models/AffiliateWidget";
import { getAffiliateWidgetsForAdmin, normalizeAffiliateWidgetDestination, validateAffiliateWidgetPayload } from "@/lib/affiliate-widgets";

export async function GET() {
  const admin = await getAdminApiSession();
  if ("error" in admin) return admin.error;
  return NextResponse.json({ widgets: await getAffiliateWidgetsForAdmin() });
}

export async function POST(request: Request) {
  const admin = await getAdminApiSession();
  if ("error" in admin) return admin.error;
  try {
    const validation = validateAffiliateWidgetPayload(await request.json());
    if ("error" in validation) return NextResponse.json({ error: validation.error }, { status: 400 });
    const data = await normalizeAffiliateWidgetDestination(validation.data);
    await connectToDatabase();
    const widget = await AffiliateWidget.create(data);
    return NextResponse.json({ widget }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save widget." }, { status: 400 });
  }
}
