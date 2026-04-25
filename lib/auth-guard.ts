import { NextResponse } from "next/server";

export const AUTH_REQUIRED_ERROR = "Please sign in to continue";

type SessionLike = {
  user?: {
    id?: string | null;
  } | null;
} | null;

export function getUnauthorizedResponse() {
  return NextResponse.json({ error: AUTH_REQUIRED_ERROR }, { status: 401 });
}

export function requireAuthenticatedUser(session: SessionLike) {
  if (!session?.user?.id) {
    return getUnauthorizedResponse();
  }

  return null;
}
