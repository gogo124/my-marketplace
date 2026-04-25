import { NextResponse } from "next/server";

type DuplicateKeyError = {
  code?: number;
  keyPattern?: Record<string, number>;
};

function isDuplicateKeyError(error: unknown): error is DuplicateKeyError {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: unknown }).code === 11000
  );
}

export function createRouteErrorResponse(
  error: unknown,
  fallback: string,
  options?: {
    duplicateKeyMessage?: string;
  }
) {
  console.error(error);

  if (isDuplicateKeyError(error)) {
    return NextResponse.json(
      { error: options?.duplicateKeyMessage || "A record with these details already exists." },
      { status: 409 }
    );
  }

  return NextResponse.json({ error: fallback }, { status: 500 });
}
