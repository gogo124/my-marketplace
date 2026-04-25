export function logServerError(scope: string, error: unknown, details?: Record<string, unknown>) {
  if (details) {
    console.error(`[server] ${scope}`, {
      details,
      error
    });
    return;
  }

  console.error(`[server] ${scope}`, error);
}
