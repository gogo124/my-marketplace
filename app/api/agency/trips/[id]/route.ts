import { NextResponse } from "next/server";
import { createRouteErrorResponse } from "@/lib/api-errors";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { saveImageFiles } from "@/lib/image-upload";
import { MAX_LISTING_IMAGES, validateImageFiles } from "@/lib/image-upload-shared";
import { getAcceptedRenterPartnerIdsForAgency } from "@/lib/partnerships";
import { isTripCodeAvailable, validateManagedTripCodeInput } from "@/lib/trip-code";
import { deleteUploadedFiles } from "@/lib/uploads";
import { validateAgencyTripPayload } from "@/lib/validation";
import { getSessionUser, getUserPermissions } from "@/lib/permissions";
import AgencyProfile from "@/models/AgencyProfile";
import AgencyTrip from "@/models/AgencyTrip";
import RenterProfile from "@/models/RenterProfile";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

export async function PATCH(request: Request, context: RouteContext) {
  let uploadedImages: string[] = [];
  let replacedImages: string[] = [];

  try {
    const session = await getAuthSession();
    const user = getSessionUser(session);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!getUserPermissions(user).canAccessAgencyWorkspace) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const { id } = await context.params;
    const formData = await request.formData();
    const files = formData.getAll("images").filter((entry): entry is File => entry instanceof File && entry.size > 0);
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
      recommendedRenterPartnerIds: formData.getAll("recommendedRenterPartnerIds"),
      status: formData.get("status")
    };
    const status = payload.status;

    await connectToDatabase();

    const profile = await AgencyProfile.findOne({ user: user.id });

    if (!profile) {
      return NextResponse.json({ error: "Agency profile not found." }, { status: 404 });
    }

    const update: Record<string, unknown> = {};
    const acceptedPartnerIds = new Set(await getAcceptedRenterPartnerIdsForAgency(String(profile._id)));

    const tripRecord = await AgencyTrip.findOne({ _id: id, agency: profile._id });

    if (!tripRecord) {
      return NextResponse.json({ error: "Trip not found." }, { status: 404 });
    }

    if (
      payload.title !== null ||
      payload.destination !== null ||
      payload.city !== null ||
      payload.description !== null ||
      payload.price !== null ||
      payload.startDate !== null ||
      payload.endDate !== null ||
      payload.seatsTotal !== null ||
      formData.get("departureCities") !== null
    ) {
      const validation = validateAgencyTripPayload(payload, true);

      if ("error" in validation) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      Object.assign(update, validation.data);

      if (Array.isArray(validation.data.renterPartnerIds)) {
        if (validation.data.renterPartnerIds.some((partnerId) => !acceptedPartnerIds.has(String(partnerId)))) {
          return NextResponse.json({ error: "Only accepted renter partners can be linked to trips." }, { status: 400 });
        }

        const validPartnersCount = await RenterProfile.countDocuments({
          _id: { $in: validation.data.renterPartnerIds }
        });

        if (validPartnersCount !== validation.data.renterPartnerIds.length) {
          return NextResponse.json({ error: "One or more renter partners are invalid." }, { status: 400 });
        }

        update.renterPartners = validation.data.renterPartnerIds;
        update.trustedRenterPartners = validation.data.trustedRenterPartnerIds || [];
        update.recommendedRenterPartners = validation.data.recommendedRenterPartnerIds || [];
      }
    }

    if (files.length > 0) {
      const imageValidationError = validateImageFiles({
        files,
        maxFiles: MAX_LISTING_IMAGES,
        label: "images per trip"
      });

      if (imageValidationError) {
        return NextResponse.json({ error: imageValidationError }, { status: 400 });
      }

      uploadedImages = await saveImageFiles(files);
      replacedImages = Array.isArray(tripRecord.images) ? tripRecord.images : [];
      update.images = uploadedImages;
    }

    if (status !== null) {
      if (status !== "active" && status !== "inactive") {
        return NextResponse.json({ error: "Invalid trip status." }, { status: 400 });
      }

      update.status = status;
    }

    if (payload.tripCode !== null) {
      const tripCodeValidation = validateManagedTripCodeInput(payload.tripCode);

      if ("error" in tripCodeValidation) {
        return NextResponse.json({ error: tripCodeValidation.error }, { status: 400 });
      }

      const available = await isTripCodeAvailable(tripCodeValidation.data, id);

      if (!available) {
        return NextResponse.json({ error: "Trip code is already in use." }, { status: 400 });
      }

      update.tripCode = tripCodeValidation.data;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
    }

    Object.assign(tripRecord, update);
    await tripRecord.save();

    if (uploadedImages.length > 0) {
      await deleteUploadedFiles(replacedImages);
    }
    return NextResponse.json({ trip: tripRecord });
  } catch (error) {
    if (uploadedImages.length > 0) {
      await deleteUploadedFiles(uploadedImages);
    }

    return createRouteErrorResponse(error, "Could not update trip.");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await getAuthSession();
    const user = getSessionUser(session);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!getUserPermissions(user).canAccessAgencyWorkspace) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const { id } = await context.params;

    await connectToDatabase();

    const profile = await AgencyProfile.findOne({ user: user.id });

    if (!profile) {
      return NextResponse.json({ error: "Agency profile not found." }, { status: 404 });
    }

    const trip = await AgencyTrip.findOneAndDelete({ _id: id, agency: profile._id });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found." }, { status: 404 });
    }

    await deleteUploadedFiles(Array.isArray(trip.images) ? trip.images : []);

    return NextResponse.json({ success: true });
  } catch (error) {
    return createRouteErrorResponse(error, "Could not delete trip.");
  }
}
