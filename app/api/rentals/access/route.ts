import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteErrorResponse } from "@/lib/api-errors";
import { getAuthSession } from "@/lib/auth";
import {
  createRentalAccessCookieValue,
  getRentalAccessCookieOptions,
  RENTAL_ACCESS_COOKIE,
  resolveAuthorizedRentalTrip
} from "@/lib/rental-access";
import { requireMarketplaceParticipant } from "@/lib/permissions";
import { checkRateLimit, getRequestIdentity } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    const deniedResponse = requireMarketplaceParticipant(session, "canValidateTripCodes");

    if (deniedResponse) {
      return deniedResponse;
    }

    const userId = session!.user!.id as string;
    const rateLimit = checkRateLimit({
      key: `rental-trip-access:${userId}:${getRequestIdentity(request, userId)}`,
      limit: 25,
      windowMs: 10 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many trip code attempts. Please try again shortly." }, { status: 429 });
    }

    const { tripCode } = await request.json();
    const access = await resolveAuthorizedRentalTrip({ userId, tripCode });

    if ("error" in access) {
      return NextResponse.json({ error: access.error }, { status: 403 });
    }

    const cookieStore = await cookies();
    const tripId = String(access.trip._id);
    const response = NextResponse.json({
      redirectTo: `/rentals/trip/${tripId}`,
      reservationStatus: "confirmed",
      tripCodeReady: true
    });

    response.cookies.set(
      RENTAL_ACCESS_COOKIE,
      createRentalAccessCookieValue(cookieStore.get(RENTAL_ACCESS_COOKIE)?.value, tripId),
      getRentalAccessCookieOptions()
    );

    return response;
  } catch (error) {
    return createRouteErrorResponse(error, "Could not validate trip code.");
  }
}
