import { NextResponse } from "next/server";
import { deleteUserByAdmin } from "@/lib/admin-delete";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

type RouteContext = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, context: RouteContext) {
  const adminSession = await getAdminApiSession(); if ("error" in adminSession) return adminSession.error;
  try {
    const { id } = await context.params; const payload = await request.json(); const update: Record<string, unknown> = {};
    if (payload.accountStatus !== undefined) { if (!["active", "disabled"].includes(payload.accountStatus)) return NextResponse.json({ error: "Invalid account status." }, { status: 400 }); update.accountStatus = payload.accountStatus; }
    if (payload.role !== undefined) { if (!["user", "agency", "renter", "admin"].includes(payload.role)) return NextResponse.json({ error: "Invalid role value." }, { status: 400 }); update.role = payload.role; update.canCreateAgency = payload.role === "agency"; update.canCreateRenter = payload.role === "renter"; }
    if (!Object.keys(update).length) return NextResponse.json({ error: "No valid admin update provided." }, { status: 400 });
    await connectToDatabase(); const user = await User.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true }).select("name email role accountStatus canCreateAgency canCreateRenter");
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 }); return NextResponse.json({ user });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update user." }, { status: 500 }); }
}
export async function DELETE(_request: Request, context: RouteContext) { const adminSession = await getAdminApiSession(); if ("error" in adminSession) return adminSession.error; try { const { id } = await context.params; await connectToDatabase(); const user = await deleteUserByAdmin(id); if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 }); return NextResponse.json({ success: true }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not delete user." }, { status: 500 }); } }
