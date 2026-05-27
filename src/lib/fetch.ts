import { getErrorMessage } from "./errors";

/**
 * Typed error thrown by `apiFetch` when the HTTP response is not ok.
 * Carries the status code and parsed body for inspection.
 */
export class FetchError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: unknown,
  ) {
    super(message);
    this.name = "FetchError";
  }
}

/**
 * Type-safe fetch wrapper.
 *
 * - Automatically parses JSON
 * - Throws `FetchError` on non-ok responses (extracts error from body)
 * - Returns typed data on success
 *
 * @example
 *   const data = await apiFetch<{ user: AuthUser }>("/api/auth/login", {
 *     method: "POST",
 *     body: JSON.stringify({ email, password }),
 *   });
 */
export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers as Record<string, string> | undefined),
    },
    ...options,
  });

  const data: unknown = await res.json();

  if (!res.ok) {
    const errorMsg =
      typeof data === "object" && data !== null && "error" in data
        ? String((data as Record<string, unknown>).error)
        : `HTTP ${res.status}`;
    throw new FetchError(errorMsg, res.status, data);
  }

  return data as T;
}

/**
 * Sugar for GET requests (no body, no method needed).
 */
export async function apiGet<T>(url: string): Promise<T> {
  return apiFetch<T>(url);
}

/**
 * Sugar for POST requests.
 */
export async function apiPost<T>(
  url: string,
  body?: unknown,
): Promise<T> {
  return apiFetch<T>(url, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/**
 * Safely wraps any async operation, returning [error, null] or [null, data].
 * Useful when you want to handle errors without try/catch boilerplate.
 *
 * @example
 *   const [err, data] = await safeAsync(fetchSomething());
 *   if (err) return setError(getErrorMessage(err));
 */
export async function safeAsync<T>(
  promise: Promise<T>,
): Promise<[null, T] | [unknown, null]> {
  try {
    const data = await promise;
    return [null, data];
  } catch (error) {
    return [error, null];
  }
}
