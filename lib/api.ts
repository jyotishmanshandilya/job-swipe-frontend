import type { ApiError, AuthResponse } from "./types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4196";

const TOKEN_KEY = "jobswipe_token";
const REFRESH_KEY = "jobswipe_refresh";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(token: string, refreshToken?: string | null) {
  localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  notifyTokenChange();
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  notifyTokenChange();
}

/**
 * Token storage as an external store (for useSyncExternalStore): subscribers
 * are notified on every login/logout/refresh, including the forced clear when
 * a token refresh fails mid-session.
 */
const tokenListeners = new Set<() => void>();

export function subscribeTokenChange(listener: () => void): () => void {
  tokenListeners.add(listener);
  return () => tokenListeners.delete(listener);
}

function notifyTokenChange() {
  tokenListeners.forEach((listener) => listener());
}

export class ApiRequestError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/** Deduplicates concurrent refresh attempts across parallel API calls. */
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return false;
      try {
        const res = await fetch(`${API_URL}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return false;
        const body = (await res.json()) as AuthResponse;
        setTokens(body.token, body.refreshToken);
        return true;
      } catch {
        return false;
      } finally {
        // Allow the next expiry to trigger a fresh attempt.
        setTimeout(() => (refreshPromise = null), 0);
      }
    })();
  }
  return refreshPromise;
}

async function rawFetch(path: string, options: RequestInit): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(`${API_URL}${path}`, { ...options, headers });
}

/**
 * Fetch wrapper: attaches the Bearer token, transparently refreshes the
 * access token once on 401 and retries, parses the ApiError envelope, and
 * redirects to /login when the session is truly gone.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let res = await rawFetch(path, options);

  if (res.status === 401 && getToken() && !path.startsWith("/api/auth/")) {
    if (await tryRefresh()) {
      res = await rawFetch(path, options);
    } else if (typeof window !== "undefined") {
      clearTokens();
      window.location.href = "/login?expired=1";
      throw new ApiRequestError(401, "Session expired");
    }
  }

  const text = await res.text();

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    let fieldErrors: Record<string, string> | undefined;
    try {
      const body = JSON.parse(text) as ApiError;
      if (body.message) message = body.message;
      fieldErrors = body.fieldErrors;
    } catch {
      if (text) message = text;
    }
    throw new ApiRequestError(res.status, message, fieldErrors);
  }

  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    // Some endpoints return plain-text messages.
    return text as unknown as T;
  }
}
