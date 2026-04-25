import { NextResponse } from "next/server";
import { createRouteErrorResponse } from "@/lib/api-errors";
import { getAdminApiSession } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import { validateReservationStatus } from "@/lib/validation";
import AgencyReservation from "@/models/AgencyReservation";
import AgencyTrip from "@/models/AgencyTrip";

export async function PATCH(request: Request) {
  const adminSession = await getAdminApiSession();

  if ("error" in adminSession) {
    return adminSession.error;
  }

  try {
    const { reservationId, status } = await request.json();

    if (!reservationId || !validateReservationStatus(status)) {
      return NextResponse.json({ error: "Invalid reservation status update." }, { status: 400 });
    }

    await connectToDatabase();

    const reservation = await AgencyReservation.findById(reservationId).select("status seats trip");

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found." }, { status: 404 });
    }

    if (reservation.status !== status) {
      if (status === "cancelled" && reservation.status !== "cancelled") {
        await AgencyTrip.findByIdAndUpdate(reservation.trip, { $inc: { seatsBooked: -Number(reservation.seats || 0) } });
      }

      if (reservation.status === "cancelled" && status !== "cancelled") {
        const trip = await AgencyTrip.findOneAndUpdate(
          {
            _id: reservation.trip,
            $expr: {
              $gte: [{ $subtract: ["$seatsTotal", "$seatsBooked"] }, Number(reservation.seats || 0)]
            }
          },
          { $inc: { seatsBooked: Number(reservation.seats || 0) } },
          { new: true }
        ).select("_id");

        if (!trip) {
          return NextResponse.json({ error: "Trip is full or unavailable." }, { status: 400 });
        }
      }

      reservation.status = status;
      await reservation.save();
    }

    return NextResponse.json({ reservation });
  } catch (error) {
    return createRouteErrorResponse(error, "Could not update reservation.");
  }
}
