import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Activity from "@/models/Activity";

type Context = { params: Promise<{ id: string }> };
export async function POST(request: Request, context: Context) {
  try {
    const { event } = await request.json() as { event?: string };
    const field = event === "view" ? "viewCount" : event === "book_click" ? "bookClickCount" : null;
    if (!field) return NextResponse.json({ error: "Unsupported analytics event." }, { status: 400 });
    await connectToDatabase();
    const { id } = await context.params;
    const activity = await Activity.findOneAndUpdate({ _id: id, status: "published" }, { $inc: { [field]: 1 } });
    if (!activity) return NextResponse.json({ error: "Activity not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Could not record activity analytics." }, { status: 400 }); }
}
