import { NextResponse } from "next/server";
import { createRouteErrorResponse } from "@/lib/api-errors";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { validateSubmittedImageUrls } from "@/lib/image-upload";
import { getSessionUser, getUserPermissions } from "@/lib/permissions";
import { getUntrustedOriginResponse, isTrustedOrigin } from "@/lib/request-guard";
import { checkRateLimit, getRequestIdentity } from "@/lib/rate-limit";
import { validateAgencyProfilePayload } from "@/lib/validation";
import AgencyProfile from "@/models/AgencyProfile";
import User from "@/models/User";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getAuthSession();
    const user = getSessionUser(session);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();

    const currentUser = await User.findById(user.id).select("role canCreateAgency");

    if (!currentUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const profile = await AgencyProfile.findOne({ user: user.id }).populate("user", "name email avatar role");

    if (!getUserPermissions(currentUser, { hasAgencyProfile: Boolean(profile?._id) }).canOpenAgencyProfile) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    return createRouteErrorResponse(error, "Could not fetch agency profile.");
  }
}

export async function POST(request: Request) {
  try {
    if (!isTrustedOrigin(request)) {
      return getUntrustedOriginResponse();
    }

    const session = await getAuthSession();
    const user = getSessionUser(session);

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();

    const currentUser = await User.findById(user.id).select("role canCreateAgency");

    if (!currentUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (currentUser.role === "renter") {
      return NextResponse.json({ error: "Renter accounts cannot create agency profiles." }, { status: 400 });
    }

    const rateLimit = checkRateLimit({
      key: `agency-profile:${user.id}:${getRequestIdentity(request, user.id)}`,
      limit: 4,
      windowMs: 15 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many profile update attempts. Please try again later." }, { status: 429 });
    }

    const existingProfile = await AgencyProfile.findOne({ user: user.id })
      .select("logo coverImage verificationStatus")
      .lean();

    if (!getUserPermissions(currentUser, { hasAgencyProfile: Boolean(existingProfile?._id) }).canOpenAgencyProfile) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const formData = await request.formData();
    const payload = {
      name: String(formData.get("name") || ""),
      city: String(formData.get("city") || ""),
      description: String(formData.get("description") || ""),
      phone: String(formData.get("phone") || ""),
      whatsapp: String(formData.get("whatsapp") || ""),
      logo: String(formData.get("logo") || ""),
      coverImage: String(formData.get("coverImage") || "")
    };
    const validation = validateAgencyProfilePayload(payload);

    if ("error" in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const imageValidationError = validateSubmittedImageUrls({
      urls: [validation.data.logo, validation.data.coverImage].filter(Boolean),
      maxFiles: 2,
      label: "agency images"
    });

    if (imageValidationError) {
      return NextResponse.json({ error: imageValidationError }, { status: 400 });
    }
    const nextLogo = validation.data.logo || existingProfile?.logo || "";
    const nextCoverImage = validation.data.coverImage || existingProfile?.coverImage || "";

    const nextVerificationStatus =
      existingProfile?.verificationStatus === "verified" ? "verified" : "pending";

    const profile = await AgencyProfile.findOneAndUpdate(
      { user: user.id },
      {
        $set: {
          ...validation.data,
          verificationStatus: nextVerificationStatus,
          logo: nextLogo,
          coverImage: nextCoverImage
        }
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    ).populate("user", "name email avatar role");

    await User.findByIdAndUpdate(user.id, { $set: { role: "agency", canCreateAgency: false } });
    return NextResponse.json({ profile, redirectTo: "/agency/dashboard" });
  } catch (error) {
    return createRouteErrorResponse(error, "Could not save agency profile.");
  }
}
