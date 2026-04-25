import { NextResponse } from "next/server";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import { isTripCodeAvailable, validateManagedTripCodeInput } from "@/lib/trip-code";
import AgencyTrip from "@/models/AgencyTrip";

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
    const { tripCode } = await request.json();
    const tripCodeValidation = validateManagedTripCodeInput(tripCode);

    if ("error" in tripCodeValidation) {
      return NextResponse.json({ error: tripCodeValidation.error }, { status: 400 });
    }

    await connectToDatabase();

    const available = await isTripCodeAvailable(tripCodeValidation.data, id);

    if (!available) {
      return NextResponse.json({ error: "Trip code is already in use." }, { status: 400 });
    }

    const trip = await AgencyTrip.findByIdAndUpdate(
      id,
      { $set: { tripCode: tripCodeValidation.data } },
      { new: true }
    );

    if (!trip) {
      return NextResponse.json({ error: "Trip not found." }, { status: 404 });
    }

    return NextResponse.json({ trip });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update trip code.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
