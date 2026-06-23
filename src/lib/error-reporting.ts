export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  console.error("[reportError]", error, context);
}
