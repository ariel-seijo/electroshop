/**
 * Shared API response contracts used across server actions, route handlers,
 * and client-side fetch calls.
 */

/** Successful API response carrier */
export interface ApiSuccess<T = void> {
  success: true;
  data?: T;
}

/** Error-only API response */
export interface ApiError {
  error: string;
}

/** Discriminated union: either success with data, or error */
export type ApiResult<T = void> = ApiSuccess<T> | ApiError;

/** Auth-specific response shapes */
export interface AuthUserPayload {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: AuthUserPayload;
}

export interface AuthMeResponse {
  user: AuthUserPayload | null;
}

/** Search response */
export interface SearchResponse {
  products: unknown[];
}

/** Settings response */
export interface SettingsResponse {
  usdToArs: number;
}

/** Generic paginated list */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}
