"use client";

type ApiPayload = Record<string, unknown>;

export async function parseApiResponse(response: Response): Promise<ApiPayload> {
  const contentType = response.headers.get("content-type") || "";
  const rawBody = await response.text();

  if (!rawBody.trim()) {
    if (response.ok) {
      return {};
    }

    throw new Error("The server returned an empty response.");
  }

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(rawBody) as ApiPayload;
    } catch {
      throw new Error("The server returned invalid JSON.");
    }
  }

  if (!response.ok) {
    throw new Error("The server returned an unexpected response.");
  }

  return {};
}

export function getApiError(payload: ApiPayload, fallback: string) {
  const error = payload.error;
  return typeof error === "string" && error.trim() ? error : fallback;
}
