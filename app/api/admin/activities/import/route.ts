import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { importActivityFromBrowserPayload, importActivityFromUrl } from "@/lib/activity-import";

const isJumiaStyleBrowserPayload = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object");

export async function POST(request: Request) {
  const admin = await getAdminApiSession();
  if ("error" in admin) return admin.error;
  try {
    const body = await request.json();
    if (isJumiaStyleBrowserPayload(body?.browserPayload)) {
      return NextResponse.json({ activity: await importActivityFromBrowserPayload(body.browserPayload) });
    }
    const sourceUrl = typeof body?.sourceUrl === "string" ? body.sourceUrl.trim() : "";
    if (!sourceUrl) return NextResponse.json({ error: "Enter an activity URL." }, { status: 400 });
    try {
      return NextResponse.json({ activity: await importActivityFromUrl(sourceUrl) });
    } catch (error) {
      return NextResponse.json({
        error: error instanceof Error ? error.message : "Could not import activity.",
        browserFallback: true,
        sourceUrl
      }, { status: 422 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not import activity." }, { status: 400 });
  }
}
