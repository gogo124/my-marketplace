import { NextResponse } from "next/server";

export function isTrustedOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  try {
    const requestOrigin = new URL(request.url).origin;
    return origin === requestOrigin;
  } catch {
    return false;
  }
}

export function getUntrustedOriginResponse() {
  return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
}

