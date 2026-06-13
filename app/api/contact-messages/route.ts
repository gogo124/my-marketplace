import { NextResponse } from "next/server";
import { checkRateLimit, getRequestIdentity } from "@/lib/rate-limit";
import { validateContactMessagePayload } from "@/lib/contact-messages";
import { connectToDatabase } from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";
export async function POST(request: Request) { const identity = getRequestIdentity(request); const limit = checkRateLimit({ key: `contact:${identity}`, limit: 5, windowMs: 60 * 60 * 1000 }); if (!limit.allowed) return NextResponse.json({ error: "Too many contact requests. Please try again later." }, { status: 429 }); try { const validation = validateContactMessagePayload(await request.json()); if ("error" in validation) return NextResponse.json({ error: validation.error }, { status: 400 }); await connectToDatabase(); const message = await ContactMessage.create(validation.data); return NextResponse.json({ messageId: message._id }, { status: 201 }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save contact message." }, { status: 500 }); } }
