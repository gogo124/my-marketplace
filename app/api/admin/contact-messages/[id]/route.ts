import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, context: Context) { const admin = await getAdminApiSession(); if ("error" in admin) return admin.error; const { status } = await request.json(); if (status !== "read" && status !== "unread") return NextResponse.json({ error: "Invalid message status." }, { status: 400 }); await connectToDatabase(); const { id } = await context.params; const message = await ContactMessage.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }); if (!message) return NextResponse.json({ error: "Contact message not found." }, { status: 404 }); return NextResponse.json({ message }); }
export async function DELETE(_request: Request, context: Context) { const admin = await getAdminApiSession(); if ("error" in admin) return admin.error; await connectToDatabase(); const { id } = await context.params; const message = await ContactMessage.findByIdAndDelete(id); if (!message) return NextResponse.json({ error: "Contact message not found." }, { status: 404 }); return NextResponse.json({ success: true }); }
