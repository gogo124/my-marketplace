import { NextResponse } from "next/server";
import { deleteReportByAdmin } from "@/lib/admin-delete";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import Report from "@/models/Report";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const adminSession = await getAdminApiSession();

  if ("error" in adminSession) {
    return adminSession.error;
  }

  try {
    const { id } = await context.params;
    const { status } = await request.json();

    if (!["pending", "reviewed", "resolved"].includes(status)) {
      return NextResponse.json({ error: "Invalid report status." }, { status: 400 });
    }

    await connectToDatabase();

    const report = await Report.findByIdAndUpdate(id, { $set: { status } }, { new: true })
      .populate("reporterId", "name email");

    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update report.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const adminSession = await getAdminApiSession();

  if ("error" in adminSession) {
    return adminSession.error;
  }

  try {
    const { id } = await context.params;

    await connectToDatabase();

    const report = await deleteReportByAdmin(id);

    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete report.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
