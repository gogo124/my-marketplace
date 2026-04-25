import { NextResponse } from "next/server";
import { createRouteErrorResponse } from "@/lib/api-errors";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getSessionUser, getUserPermissions, requireMarketplaceParticipant } from "@/lib/permissions";
import { checkRateLimit, getRequestIdentity } from "@/lib/rate-limit";
import { validateReservationPayload } from "@/lib/validation";
import { validateReservationStatus } from "@/lib/validation";
import AgencyProfile from "@/models/AgencyProfile";
import AgencyReservation from "@/models/AgencyReservation";
import AgencyTrip from "@/models/AgencyTrip";

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    const deniedResponse = requireMarketplaceParticipant(session, "canReserveTrips");

    if (deniedResponse) {
      return deniedResponse;
    }

    const userId = session!.user!.id as string;
    const identity = userId || getRequestIdentity(request);
    const rateLimit = checkRateLimit({
      key: `reservation:${identity}`,
      limit: 10,
      windowMs: 30 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many reservation attempts. Please try again shortly." }, { status: 429 });
    }

    const payload = await request.json();
    const validation = validateReservationPayload(payload);

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    await connectToDatabase();

    const agency = await AgencyProfile.findById(validation.data.agencyId).select("_id");

    if (!agency) {
      return NextResponse.json({ error: "Agency not found." }, { status: 404 });
    }

    const trip = await AgencyTrip.findOneAndUpdate(
      {
        _id: validation.data.tripId,
        agency: validation.data.agencyId,
        status: "active",
        $expr: {
          $gte: [{ $subtract: ["$seatsTotal", "$seatsBooked"] }, validation.data.seats]
        }
      },
      {
        $inc: { seatsBooked: validation.data.seats }
      },
      {
        new: true
      }
    );

    if (!trip) {
      return NextResponse.json({ error: "Trip is full or unavailable." }, { status: 400 });
    }

    const duplicateWindowStart = new Date(Date.now() - 10 * 60 * 1000);
    const duplicateReservation = await AgencyReservation.findOne({
      trip: validation.data.tripId,
      phoneNumber: validation.data.phoneNumber,
      createdAt: { $gte: duplicateWindowStart }
    }).select("_id");

    if (duplicateReservation) {
      await AgencyTrip.findByIdAndUpdate(validation.data.tripId, {
        $inc: { seatsBooked: -validation.data.seats }
      });

      return NextResponse.json({ error: "A recent reservation already exists for this phone number." }, { status: 409 });
    }

    let reservation;

    try {
      const unitPrice = Number(trip.price || 0);
      const totalPrice = unitPrice * validation.data.seats;
      reservation = await AgencyReservation.create({
        trip: validation.data.tripId,
        agency: validation.data.agencyId,
        user: userId,
        customerName: validation.data.customerName,
        customerEmail: validation.data.customerEmail,
        phoneNumber: validation.data.phoneNumber,
        city: validation.data.city,
        seats: validation.data.seats,
        preferredDate: validation.data.preferredDate,
        unitPrice,
        totalPrice,
        status: "pending"
      });
    } catch (error) {
      await AgencyTrip.findByIdAndUpdate(validation.data.tripId, {
        $inc: { seatsBooked: -validation.data.seats }
      });

      throw error;
    }

    return NextResponse.json({ reservation, trip, successMessage: "Reservation submitted successfully." }, { status: 201 });
  } catch (error) {
    return createRouteErrorResponse(error, "Could not create reservation.");
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getAuthSession();
    const user = getSessionUser(session);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!getUserPermissions(user).canAccessAgencyWorkspace) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const userId = user.id as string;

    const { reservationId, status } = await request.json();

    if (!reservationId || !validateReservationStatus(status)) {
      return NextResponse.json({ error: "Invalid reservation status update." }, { status: 400 });
    }

    await connectToDatabase();

    const profile = await AgencyProfile.findOne({ user: userId }).select("_id");

    if (!profile) {
      return NextResponse.json({ error: "Agency profile not found." }, { status: 404 });
    }

    const reservation = await AgencyReservation.findOne({ _id: reservationId, agency: profile._id })
      .select("status seats trip");

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found." }, { status: 404 });
    }

    if (reservation.status === status) {
      return NextResponse.json({ reservation });
    }

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

    return NextResponse.json({ reservation });
  } catch (error) {
    return createRouteErrorResponse(error, "Could not update reservation.");
  }
}
