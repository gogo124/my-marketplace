export function logServerError(scope: string, error: unknown, details?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  if (details) {
    console.error(`[server] ${scope}`, {
      details,
      error
    });
    return;
  }

  console.error(`[server] ${scope}`, error);
}
