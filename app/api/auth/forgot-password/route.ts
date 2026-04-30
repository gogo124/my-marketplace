import { NextResponse } from "next/server";
import { createPasswordResetToken, savePasswordResetToken } from "@/lib/password-reset";
import { logServerError } from "@/lib/server-log";
import { connectToDatabase } from "@/lib/db";
import { checkRateLimit, getRequestIdentity } from "@/lib/rate-limit";
import { isTrustedOrigin, getUntrustedOriginResponse } from "@/lib/request-guard";
import { isBrevoConfigured, sendPasswordResetEmail } from "@/lib/brevo";
import User from "@/models/User";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUCCESS_MESSAGE = "If an account exists for this email, a reset link has been sent.";

export async function POST(request: Request) {
  try {
    if (!isTrustedOrigin(request)) {
      return getUntrustedOriginResponse();
    }

    const rateLimit = checkRateLimit({
      key: `forgot-password:${getRequestIdentity(request)}`,
      limit: 5,
      windowMs: 15 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many password reset attempts. Please try again later." }, { status: 429 });
    }

    const { email } = await request.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      return NextResponse.json({ message: SUCCESS_MESSAGE });
    }

    if (!isBrevoConfigured()) {
      return NextResponse.json({ error: "Password reset service is not configured." }, { status: 503 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: normalizedEmail }).select("_id accountStatus");

    if (!user || user.accountStatus === "disabled") {
      return NextResponse.json({ message: SUCCESS_MESSAGE });
    }

    const { token, tokenHash, expiresAt } = createPasswordResetToken();

    await savePasswordResetToken(String(user._id), tokenHash, expiresAt);
    await sendPasswordResetEmail({ to: normalizedEmail, resetToken: token });

    return NextResponse.json({ message: SUCCESS_MESSAGE });
  } catch (error) {
    logServerError("api.auth.forgot-password", error);
    return NextResponse.json({ error: "Could not send reset email." }, { status: 500 });
  }
}
