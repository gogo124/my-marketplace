import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import AgencyProfile from "@/models/AgencyProfile";
import AgencyTrip from "@/models/AgencyTrip";

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();

    const profile = await AgencyProfile.findOne({ user: session.user.id });

    if (!profile) {
      return NextResponse.json({ trips: [] });
    }

    const trips = await AgencyTrip.find({ agency: profile._id }).sort({ createdAt: -1 });

    return NextResponse.json({ trips });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not fetch trips.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { title, destination, city, description, price, startDate, endDate, seatsTotal } = await request.json();

    if (!title || !destination || !city || !startDate || !endDate || Number(price) < 0 || Number(seatsTotal) < 1) {
      return NextResponse.json({ error: "Invalid trip payload." }, { status: 400 });
    }

    await connectToDatabase();

    const profile = await AgencyProfile.findOne({ user: session.user.id });

    if (!profile) {
      return NextResponse.json({ error: "Create your agency profile first." }, { status: 400 });
    }

    const trip = await AgencyTrip.create({
      agency: profile._id,
      owner: session.user.id,
      title: String(title).trim(),
      destination: String(destination).trim(),
      city: String(city).trim(),
      description: String(description || "").trim(),
      price: Number(price),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      seatsTotal: Number(seatsTotal)
    });

    return NextResponse.json({ trip }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create trip.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
