import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteErrorResponse } from "@/lib/api-errors";
import { getAuthSession } from "@/lib/auth";
import { requireMarketplaceParticipant } from "@/lib/permissions";
import {
  RENTAL_ACCESS_COOKIE,
  resolveAuthorizedRentalTrip,
  validateAuthorizedRentalItemAccess
} from "@/lib/rental-access";
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
      key: `rental-unlock:${userId}:${getRequestIdentity(request, userId)}`,
      limit: 25,
      windowMs: 10 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many trip code attempts. Please try again shortly." }, { status: 429 });
    }

    const { tripCode, tripId, rentalItemId } = await request.json();

    if (!rentalItemId) {
      return NextResponse.json({ error: "Rental item is required." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const access = await resolveAuthorizedRentalTrip({
      userId,
      tripCode,
      tripId,
      cookieValue: cookieStore.get(RENTAL_ACCESS_COOKIE)?.value
    });

    if ("error" in access) {
      return NextResponse.json({ error: access.error }, { status: 403 });
    }

    const validation = await validateAuthorizedRentalItemAccess({
      trip: {
        _id: String(access.trip._id),
        agency: String(access.trip.agency),
        renterPartners: access.trip.renterPartners
      },
      rentalItemId
    });

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 403 });
    }

    return NextResponse.json(validation.data);
  } catch (error) {
    return createRouteErrorResponse(error, "Could not validate trip code.");
  }
}
