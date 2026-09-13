import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import AffiliateWidget from "@/models/AffiliateWidget";
import { normalizeAffiliateWidgetDestination, validateAffiliateWidgetPayload } from "@/lib/affiliate-widgets";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const admin = await getAdminApiSession();
  if ("error" in admin) return admin.error;
  const { id } = await context.params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: "Invalid widget id." }, { status: 400 });
  try {
    const validation = validateAffiliateWidgetPayload(await request.json());
    if ("error" in validation) return NextResponse.json({ error: validation.error }, { status: 400 });
    const data = await normalizeAffiliateWidgetDestination(validation.data);
    await connectToDatabase();
    const widget = await AffiliateWidget.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!widget) return NextResponse.json({ error: "Affiliate widget not found." }, { status: 404 });
    return NextResponse.json({ widget });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update widget." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  const admin = await getAdminApiSession();
  if ("error" in admin) return admin.error;
  const { id } = await context.params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: "Invalid widget id." }, { status: 400 });
  await connectToDatabase();
  const widget = await AffiliateWidget.findByIdAndDelete(id);
  if (!widget) return NextResponse.json({ error: "Affiliate widget not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
