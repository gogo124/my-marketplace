import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import AgencyProfile from "@/models/AgencyProfile";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();

    const profile = await AgencyProfile.findOne({ user: session.user.id }).populate("user", "name email avatar role");

    return NextResponse.json({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not fetch agency profile.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { name, logo, coverImage, city, description, phone, whatsapp } = await request.json();

    if (!name || !city || !phone || !whatsapp) {
      return NextResponse.json({ error: "Invalid agency profile payload." }, { status: 400 });
    }

    await connectToDatabase();

    await User.findByIdAndUpdate(session.user.id, { $set: { role: "agency" } });

    const profile = await AgencyProfile.findOneAndUpdate(
      { user: session.user.id },
      {
        $set: {
          name: String(name).trim(),
          logo: String(logo || "").trim(),
          coverImage: String(coverImage || "").trim(),
          city: String(city).trim(),
          description: String(description || "").trim(),
          phone: String(phone).trim(),
          whatsapp: String(whatsapp).trim()
        }
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    ).populate("user", "name email avatar role");

    return NextResponse.json({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save agency profile.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
