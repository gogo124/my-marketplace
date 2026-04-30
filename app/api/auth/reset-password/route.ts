import { NextResponse } from "next/server";
import { consumePasswordResetToken } from "@/lib/password-reset";
import { checkRateLimit, getRequestIdentity } from "@/lib/rate-limit";
import { isTrustedOrigin, getUntrustedOriginResponse } from "@/lib/request-guard";
import { logServerError } from "@/lib/server-log";

function validatePassword(password: string) {
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "Password must contain letters and numbers.";
  }

  return "";
}

export async function POST(request: Request) {
  try {
    if (!isTrustedOrigin(request)) {
      return getUntrustedOriginResponse();
    }

    const rateLimit = checkRateLimit({
      key: `reset-password:${getRequestIdentity(request)}`,
      limit: 8,
      windowMs: 15 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many password reset attempts. Please try again later." }, { status: 429 });
    }

    const { token, password } = await request.json();
    const normalizedToken = String(token || "").trim();
    const normalizedPassword = String(password || "");

    if (!normalizedToken) {
      return NextResponse.json({ error: "Reset token is required." }, { status: 400 });
    }

    const passwordError = validatePassword(normalizedPassword);

    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const result = await consumePasswordResetToken({
      token: normalizedToken,
      password: normalizedPassword
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (error) {
    logServerError("api.auth.reset-password", error);
    return NextResponse.json({ error: "Could not reset password." }, { status: 500 });
  }
}
