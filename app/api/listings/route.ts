import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Listing from "@/models/Listing";

const ACCEPTED_IMAGE_TYPES = new Set(["image/png", "image/jpeg"]);
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 6;

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectToDatabase();

    const listings = await Listing.find({})
      .populate("seller", "name email avatar")
      .sort({ createdAt: -1 });

    return NextResponse.json({ listings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not fetch listings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const formData = await request.formData();
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const price = Number(formData.get("price"));
    const category = String(formData.get("category") || "").trim();
    const location = String(formData.get("location") || "").trim();
    const files = formData.getAll("images").filter((entry): entry is File => entry instanceof File);

    if (!title || !description || !category || !location || Number.isNaN(price) || price < 0) {
      return NextResponse.json({ error: "Invalid listing payload." }, { status: 400 });
    }

    if (files.length > MAX_IMAGES) {
      return NextResponse.json(
        { error: `You can upload up to ${MAX_IMAGES} images per listing.` },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: "Only PNG and JPEG images are allowed." },
          { status: 400 }
        );
      }

      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: "Each image must be 5 MB or smaller." },
          { status: 400 }
        );
      }
    }

    await connectToDatabase();

    const uploadDirectory = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDirectory, { recursive: true });

    const images = await Promise.all(
      files.map(async (file) => {
        const extension = file.type === "image/png" ? "png" : "jpg";
        const fileName = `${randomUUID()}.${extension}`;
        const filePath = path.join(uploadDirectory, fileName);
        const buffer = Buffer.from(await file.arrayBuffer());

        await writeFile(filePath, buffer);

        return `/uploads/${fileName}`;
      })
    );

    const listing = await Listing.create({
      title,
      description,
      price,
      category,
      location,
      images,
      seller: session.user.id
    });

    const populatedListing = await listing.populate("seller", "name email avatar");

    return NextResponse.json({ listing: populatedListing }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create listing.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
