import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { checkRateLimit, getRequestIdentity } from "@/lib/rate-limit";
import { validateReportPayload } from "@/lib/validation";
import AgencyProfile from "@/models/AgencyProfile";
import Listing from "@/models/Listing";
import Place from "@/models/Place";
import Report from "@/models/Report";
import Review from "@/models/Review";
import TravelPost from "@/models/TravelPost";
import User from "@/models/User";

async function targetExists(targetType: string, targetId: string) {
  switch (targetType) {
    case "listing":
      return Boolean(await Listing.findById(targetId).select("_id"));
    case "agency":
      return Boolean(await AgencyProfile.findById(targetId).select("_id"));
    case "travel-post":
      return Boolean(await TravelPost.findById(targetId).select("_id"));
    case "user":
      return Boolean(await User.findById(targetId).select("_id"));
    case "review":
      return Boolean(await Review.findById(targetId).select("_id"));
    case "place":
      return Boolean(await Place.findById(targetId).select("_id"));
    default:
      return false;
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const rateLimit = checkRateLimit({
      key: `report:${session.user.id}:${getRequestIdentity(request, session.user.id)}`,
      limit: 10,
      windowMs: 60 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many reports. Please try again later." }, { status: 429 });
    }

    const payload = await request.json();
    const validation = validateReportPayload(payload);

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    await connectToDatabase();

    const exists = await targetExists(validation.data.targetType, validation.data.targetId);

    if (!exists) {
      return NextResponse.json({ error: "Reported item was not found." }, { status: 404 });
    }

    const duplicateReport = await Report.findOne({
      reporterId: session.user.id,
      targetType: validation.data.targetType,
      targetId: validation.data.targetId,
      reason: validation.data.reason,
      status: { $in: ["pending", "reviewed"] }
    }).select("_id");

    if (duplicateReport) {
      return NextResponse.json({ error: "You already reported this item." }, { status: 409 });
    }

    const report = await Report.create({
      reporterId: session.user.id,
      targetType: validation.data.targetType,
      targetId: validation.data.targetId,
      reason: validation.data.reason,
      description: validation.data.description,
      status: "pending"
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not submit report.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
