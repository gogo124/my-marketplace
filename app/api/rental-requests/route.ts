import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteErrorResponse } from "@/lib/api-errors";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getSessionUser, getUserPermissions, requireMarketplaceParticipant } from "@/lib/permissions";
import { getAllowedRenterIdsForAuthorizedTrip, RENTAL_ACCESS_COOKIE, resolveAuthorizedRentalTrip } from "@/lib/rental-access";
import { checkRateLimit, getRequestIdentity } from "@/lib/rate-limit";
import { validateRentalRequestPayload, validateRentalRequestStatus } from "@/lib/validation";
import AgencyProfile from "@/models/AgencyProfile";
import RentalItem from "@/models/RentalItem";
import RentalRequest from "@/models/RentalRequest";
import RenterProfile from "@/models/RenterProfile";

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    const deniedResponse = requireMarketplaceParticipant(session, "canRequestRentals");

    if (deniedResponse) {
      return deniedResponse;
    }

    const userId = session!.user!.id as string;
    const rateLimit = checkRateLimit({
      key: `rental-request:${userId}:${getRequestIdentity(request, userId)}`,
      limit: 10,
      windowMs: 10 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many rental requests. Please try again shortly." }, { status: 429 });
    }

    const payload = await request.json();
    const validation = validateRentalRequestPayload(payload);

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    await connectToDatabase();

    const cookieStore = await cookies();
    const access = await resolveAuthorizedRentalTrip({
      userId,
      tripCode: validation.data.tripCode || undefined,
      tripId: validation.data.tripId || undefined,
      cookieValue: cookieStore.get(RENTAL_ACCESS_COOKIE)?.value
    });

    if ("error" in access) {
      return NextResponse.json({ error: access.error }, { status: 403 });
    }

    const trip = access.trip;

    const agency = await AgencyProfile.findById(trip.agency).select("_id linkedRenterPartners");

    if (!agency) {
      return NextResponse.json({ error: "Trip not found for this agency." }, { status: 404 });
    }

    const allowedRenterIds = await getAllowedRenterIdsForAuthorizedTrip({
      agency: String(trip.agency),
      renterPartners: trip.renterPartners
    });

    if (!allowedRenterIds) {
      return NextResponse.json({ error: "Agency profile not found." }, { status: 404 });
    }

    if (validation.data.renterId) {
      if (!allowedRenterIds.has(validation.data.renterId)) {
        return NextResponse.json({ error: "Selected renter is not linked to this trip." }, { status: 400 });
      }

      const renter = await RenterProfile.findById(validation.data.renterId).select("_id");

      if (!renter) {
        return NextResponse.json({ error: "Selected renter was not found." }, { status: 404 });
      }
    }

    if (validation.data.rentalItemId) {
      const item = await RentalItem.findById(validation.data.rentalItemId).select(
        "_id renter quantityAvailable status availabilityStatus price"
      );

      if (!item) {
        return NextResponse.json({ error: "Selected rental item was not found." }, { status: 404 });
      }

      if (!allowedRenterIds.has(String(item.renter))) {
        return NextResponse.json({ error: "Selected item is not linked to an accepted renter partner for this trip." }, { status: 400 });
      }

      if (validation.data.renterId && String(item.renter) !== validation.data.renterId) {
        return NextResponse.json({ error: "Selected item does not belong to the selected renter." }, { status: 400 });
      }

      if (
        item.status !== "active" ||
        item.availabilityStatus === "unavailable" ||
        Number(item.quantityAvailable || 0) < 1
      ) {
        return NextResponse.json({ error: "Selected item is not currently available." }, { status: 400 });
      }

      if (validation.data.quantity > Number(item.quantityAvailable || 0)) {
        return NextResponse.json({ error: "Requested quantity exceeds the currently available stock." }, { status: 400 });
      }
    }

    let unitPrice = 0;

    if (validation.data.rentalItemId) {
      const selectedItem = await RentalItem.findById(validation.data.rentalItemId).select("price").lean();
      unitPrice = Number(selectedItem?.price || 0);
    }

    const totalPrice = unitPrice * Number(validation.data.quantity || 1) * Number(validation.data.durationDays || 1);

    const { tripCode: _tripCode, tripId: _tripId, renterId, rentalItemId, ...rentalRequestData } = validation.data;

    const rentalRequest = await RentalRequest.create({
      ...rentalRequestData,
      user: userId,
      trip: trip._id,
      agency: trip.agency,
      renter: renterId,
      rentalItem: rentalItemId,
      unitPrice,
      totalPrice,
      status: "pending"
    });

    return NextResponse.json({ rentalRequest }, { status: 201 });
  } catch (error) {
    return createRouteErrorResponse(error, "Could not create rental request.");
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getAuthSession();
    const user = getSessionUser(session);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { rentalRequestId, status } = await request.json();

    if (!rentalRequestId || !validateRentalRequestStatus(status)) {
      return NextResponse.json({ error: "Invalid rental request status update." }, { status: 400 });
    }

    await connectToDatabase();

    let rentalRequest = null;

    if (getUserPermissions(user).canAccessAdminWorkspace) {
      rentalRequest = await RentalRequest.findByIdAndUpdate(
        rentalRequestId,
        { $set: { status } },
        { new: true }
      );
    } else if (getUserPermissions(user).canAccessRenterWorkspace) {
      const profile = await RenterProfile.findOne({ user: user.id }).select("_id");

      if (!profile) {
        return NextResponse.json({ error: "Renter profile not found." }, { status: 404 });
      }

      rentalRequest = await RentalRequest.findOneAndUpdate(
        { _id: rentalRequestId, renter: profile._id },
        { $set: { status } },
        { new: true }
      );
    } else {
      if (!getUserPermissions(user).canAccessAgencyWorkspace) {
        return NextResponse.json({ error: "Access denied." }, { status: 403 });
      }

      const profile = await AgencyProfile.findOne({ user: user.id }).select("_id");

      if (!profile) {
        return NextResponse.json({ error: "Agency profile not found." }, { status: 404 });
      }

      rentalRequest = await RentalRequest.findOneAndUpdate(
        { _id: rentalRequestId, agency: profile._id },
        { $set: { status } },
        { new: true }
      );
    }

    if (!rentalRequest) {
      return NextResponse.json({ error: "Rental request not found." }, { status: 404 });
    }

    return NextResponse.json({ rentalRequest });
  } catch (error) {
    return createRouteErrorResponse(error, "Could not update rental request.");
  }
}
