/**
 * Type-safe error message extraction.
 *
 * Handles Error instances, string throws, and unknown error types
 * without unsafe `(error as Error).message` casts.
 *
 * @example
 *   try { ... } catch (error) {
 *     const msg = getErrorMessage(error);
 *     // msg is always a string
 *   }
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "Error desconocido";
  }
}
