import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createRouteErrorResponse } from "@/lib/api-errors";
import { connectToDatabase } from "@/lib/db";
import { logServerError } from "@/lib/server-log";
import { isTrustedOrigin, getUntrustedOriginResponse } from "@/lib/request-guard";
import { checkRateLimit, getRequestIdentity } from "@/lib/rate-limit";
import User from "@/models/User";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "yopmail.com"
]);

export async function POST(request: Request) {
  try {
    if (!isTrustedOrigin(request)) {
      return getUntrustedOriginResponse();
    }

    const rateLimit = checkRateLimit({
      key: `register:${getRequestIdentity(request)}`,
      limit: 5,
      windowMs: 15 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many registration attempts. Please try again later." }, { status: 429 });
    }

    const { name, email, password, website, formStartedAt } = await request.json();
    const normalizedName = String(name || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedPassword = String(password || "");
    const normalizedWebsite = String(website || "").trim();
    const submittedAt = Number(formStartedAt || 0);
    const emailDomain = normalizedEmail.split("@")[1] || "";

    if (!normalizedName || !normalizedEmail || !normalizedPassword) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (normalizedWebsite) {
      return NextResponse.json({ error: "Registration blocked." }, { status: 400 });
    }

    if (!submittedAt || Date.now() - submittedAt < 1500) {
      return NextResponse.json({ error: "Registration blocked." }, { status: 400 });
    }

    if (normalizedName.length < 2 || normalizedName.length > 60) {
      return NextResponse.json({ error: "Enter a valid full name." }, { status: 400 });
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    if (DISPOSABLE_EMAIL_DOMAINS.has(emailDomain)) {
      return NextResponse.json({ error: "Disposable email addresses are not allowed." }, { status: 400 });
    }

    if (normalizedPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (!/[A-Za-z]/.test(normalizedPassword) || !/\d/.test(normalizedPassword)) {
      return NextResponse.json({ error: "Password must contain letters and numbers." }, { status: 400 });
    }

    try {
      await connectToDatabase();
    } catch (error) {
      logServerError("api.register.db", error, {
        email: normalizedEmail
      });

      return NextResponse.json({ error: "Authentication service is unavailable." }, { status: 503 });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(normalizedPassword, 12);
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
      canCreateAgency: false,
      canCreateRenter: false
    });

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return createRouteErrorResponse(error, "Registration failed.", {
      duplicateKeyMessage: "Email is already registered."
    });
  }
}
