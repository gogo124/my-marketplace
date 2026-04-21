import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import AgencyProfile from "@/models/AgencyProfile";
import AgencyTrip from "@/models/AgencyTrip";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await context.params;
    const { title, destination, city, description, price, startDate, endDate, seatsTotal, status } =
      await request.json();

    await connectToDatabase();

    const profile = await AgencyProfile.findOne({ user: session.user.id });

    if (!profile) {
      return NextResponse.json({ error: "Agency profile not found." }, { status: 404 });
    }

    const update: Record<string, unknown> = {};

    if (typeof title === "string") update.title = title.trim();
    if (typeof destination === "string") update.destination = destination.trim();
    if (typeof city === "string") update.city = city.trim();
    if (typeof description === "string") update.description = description.trim();
    if (price !== undefined) update.price = Number(price);
    if (startDate) update.startDate = new Date(startDate);
    if (endDate) update.endDate = new Date(endDate);
    if (seatsTotal !== undefined) update.seatsTotal = Number(seatsTotal);
    if (status === "active" || status === "inactive") update.status = status;

    const trip = await AgencyTrip.findOneAndUpdate({ _id: id, agency: profile._id }, { $set: update }, { new: true });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found." }, { status: 404 });
    }

    return NextResponse.json({ trip });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update trip.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await context.params;

    await connectToDatabase();

    const profile = await AgencyProfile.findOne({ user: session.user.id });

    if (!profile) {
      return NextResponse.json({ error: "Agency profile not found." }, { status: 404 });
    }

    const trip = await AgencyTrip.findOneAndDelete({ _id: id, agency: profile._id });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete trip.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
