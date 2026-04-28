import { NextResponse } from "next/server";
import { createRouteErrorResponse } from "@/lib/api-errors";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getSubmittedImageUrls, validateSubmittedImageUrls } from "@/lib/image-upload";
import { MAX_LISTING_IMAGES } from "@/lib/image-upload-shared";
import { getAcceptedRenterPartnerIdsForAgency } from "@/lib/partnerships";
import { generateUniqueTripCode, isTripCodeAvailable, validateManagedTripCodeInput } from "@/lib/trip-code";
import { validateAgencyTripPayload } from "@/lib/validation";
import { getSessionUser, getUserPermissions } from "@/lib/permissions";
import AgencyProfile from "@/models/AgencyProfile";
import AgencyTrip from "@/models/AgencyTrip";
import RenterProfile from "@/models/RenterProfile";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getAuthSession();
    const user = getSessionUser(session);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();

    const profile = await AgencyProfile.findOne({ user: user.id }).select("_id");
    const permissions = getUserPermissions(user, { hasAgencyProfile: Boolean(profile?._id) });

    if (!permissions.canAccessAgencyWorkspace) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    if (!profile) {
      return NextResponse.json({ trips: [] });
    }

    const trips = await AgencyTrip.find({ agency: profile._id }).sort({ createdAt: -1 });

    return NextResponse.json({ trips });
  } catch (error) {
    return createRouteErrorResponse(error, "Could not fetch trips.");
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    const user = getSessionUser(session);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const formData = await request.formData();
    const imageUrls = getSubmittedImageUrls(formData, "images");
    const payload = {
      title: formData.get("title"),
      destination: formData.get("destination"),
      city: formData.get("city"),
      departureCities: String(formData.get("departureCities") || "")
        .split("\n")
        .map((value) => value.trim())
        .filter(Boolean),
      region: formData.get("region"),
      description: formData.get("description"),
      price: formData.get("price"),
      tripCode: formData.get("tripCode"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      seatsTotal: formData.get("seatsTotal"),
      equipmentRequirements: String(formData.get("equipmentRequirements") || "")
        .split("\n")
        .map((value) => value.trim())
        .filter(Boolean),
      renterPartnerIds: formData.getAll("renterPartnerIds"),
      trustedRenterPartnerIds: formData.getAll("trustedRenterPartnerIds"),
      recommendedRenterPartnerIds: formData.getAll("recommendedRenterPartnerIds")
    };
    const validation = validateAgencyTripPayload(payload);

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const imageValidationError = validateSubmittedImageUrls({
      urls: imageUrls,
      maxFiles: MAX_LISTING_IMAGES,
      label: "images per trip"
    });

    if (imageValidationError) {
      return NextResponse.json({ error: imageValidationError }, { status: 400 });
    }

    await connectToDatabase();

    const profile = await AgencyProfile.findOne({ user: user.id }).select("_id");
    const permissions = getUserPermissions(user, { hasAgencyProfile: Boolean(profile?._id) });

    if (!permissions.canAccessAgencyWorkspace) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    if (!profile) {
      return NextResponse.json({ error: "Create your agency profile first." }, { status: 400 });
    }

    const acceptedPartnerIds = new Set(await getAcceptedRenterPartnerIdsForAgency(String(profile._id)));

    if (Array.isArray(validation.data.renterPartnerIds) && validation.data.renterPartnerIds.length > 0) {
      if (validation.data.renterPartnerIds.some((partnerId) => !acceptedPartnerIds.has(String(partnerId)))) {
        return NextResponse.json({ error: "Only accepted renter partners can be linked to trips." }, { status: 400 });
      }

      const validPartnersCount = await RenterProfile.countDocuments({
        _id: { $in: validation.data.renterPartnerIds }
      });

      if (validPartnersCount !== validation.data.renterPartnerIds.length) {
        return NextResponse.json({ error: "One or more renter partners are invalid." }, { status: 400 });
      }
    }

    let tripCode = await generateUniqueTripCode();

    if (payload.tripCode !== undefined) {
      const tripCodeValidation = validateManagedTripCodeInput(payload.tripCode, { allowBlank: true });

      if ("error" in tripCodeValidation) {
        return NextResponse.json({ error: tripCodeValidation.error }, { status: 400 });
      }

      if (tripCodeValidation.data) {
        const available = await isTripCodeAvailable(tripCodeValidation.data);

        if (!available) {
          return NextResponse.json({ error: "Trip code is already in use." }, { status: 400 });
        }

        tripCode = tripCodeValidation.data;
      }
    }

    const trip = await AgencyTrip.create({
      agency: profile._id,
      owner: user.id,
      tripCode,
      ...validation.data,
      images: imageUrls,
      renterPartners: validation.data.renterPartnerIds || [],
      trustedRenterPartners: validation.data.trustedRenterPartnerIds || [],
      recommendedRenterPartners: validation.data.recommendedRenterPartnerIds || []
    });

    return NextResponse.json({ trip }, { status: 201 });
  } catch (error) {
    return createRouteErrorResponse(error, "Could not create trip.");
  }
}
