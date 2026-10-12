import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiError } from "@/types";

/**
 * AXIOS CLIENT
 * ------------
 * Single instance shared by every service module.
 *
 * Responsibilities:
 *  - Base URL points at the API prefix; in dev, Vite's proxy handles /api so
 *    there are no CORS surprises and the same URL works in prod.
 *  - Attaches the JWT from localStorage on every request.
 *  - Normalises every failure into `ApiError` so callers never have to
 *    distinguish transport errors from HTTP errors.
 */

export const TOKEN_KEY = "eventora-token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private browsing — auth simply will not persist */
  }
}

/** Fired on 401 so the auth store can react without a circular import. */
export const AUTH_EXPIRED_EVENT = "eventora:auth-expired";

const baseURL = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api/v1";

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 20_000,
  withCredentials: false,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Lightweight trace id so backend logs can be correlated to a UI action.
  config.headers["X-Request-Id"] = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const status = error.response?.status;
    const body = error.response?.data;

    if (status === 401) {
      setToken(null);
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
    }

    return Promise.reject(normaliseError(error, body, status));
  },
);

export type ApiErrorPayload = ApiError;

/** Convert any transport/HTTP failure into the backend `ApiError` shape. */
export function normaliseError(
  error: AxiosError,
  body: ApiError | undefined,
  status: number | undefined,
): ApiErrorPayload {
  if (body && typeof body === "object" && "errorCode" in body) {
    return body as ApiErrorPayload;
  }

  if (error.code === "ECONNABORTED") {
    return {
      success: false,
      message: "The request timed out. Please check your connection and try again.",
      errorCode: "TIMEOUT",
      timestamp: new Date().toISOString(),
    };
  }

  if (!status) {
    return {
      success: false,
      message: "Network error — the event service is unreachable.",
      errorCode: "NETWORK_ERROR",
      timestamp: new Date().toISOString(),
    };
  }

  const fallback: Record<number, { message: string; errorCode: string }> = {
    400: { message: "The request could not be processed.", errorCode: "BAD_REQUEST" },
    403: { message: "You do not have permission to perform this action.", errorCode: "FORBIDDEN" },
    404: { message: "The requested resource was not found.", errorCode: "NOT_FOUND" },
    409: { message: "This action conflicts with the current state.", errorCode: "CONFLICT" },
    500: { message: "Something went wrong on our side. Please try again.", errorCode: "INTERNAL_ERROR" },
    503: { message: "The service is temporarily unavailable.", errorCode: "SERVICE_UNAVAILABLE" },
  };

  return {
    success: false,
    ...fallback[status] ?? { message: "Unexpected error.", errorCode: "UNKNOWN" },
    timestamp: new Date().toISOString(),
  };
}

/** Typed unwrap of `{ success, data }` envelopes. */
export async function unwrap<T>(promise: Promise<{ data: { success: true; data: T } }>): Promise<T> {
  const response = await promise;
  return response.data.data;
}

/** Build a query string from a record, dropping `undefined`/empty values. */
export function toQuery(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (typeof value === "boolean") search.append(key, String(value));
    else if (typeof value === "number") search.append(key, String(value));
    else search.append(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export type { AxiosRequestConfig };
