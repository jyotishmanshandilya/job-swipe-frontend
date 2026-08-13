import type {
  ApiError,
  AuthResponse,
  Job,
  JobReport,
  MyJobReport,
  Page,
  ReportReason,
} from "./types";

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

  // 401 = token expired/missing; some backend configs return 403 for the same
  // condition — handle both identically: try a silent refresh then redirect.
  if ((res.status === 401 || res.status === 403) && getToken() && !path.startsWith("/api/auth/")) {
    if (await tryRefresh()) {
      res = await rawFetch(path, options);
    } else if (typeof window !== "undefined") {
      clearTokens();
      window.location.href = "/login?expired=1";
      throw new ApiRequestError(res.status, "Session expired");
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

/**
 * Flag a job (idempotent per user+job). The backend removes it from this
 * user's matched feed on the next fetch.
 */
export function reportJob(
  jobId: string,
  body: { reason: ReportReason; details?: string },
): Promise<JobReport> {
  return apiFetch<JobReport>(`/api/jobs/${jobId}/report`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** The current user's reports, newest first, with job context. */
export function getMyReports(): Promise<MyJobReport[]> {
  return apiFetch<MyJobReport[]>("/api/jobs/reports/mine");
}

/** Withdraws a report (undo) — the job returns to the matched feed. Idempotent. */
export function unreportJob(jobId: string): Promise<void> {
  return apiFetch<void>(`/api/jobs/${jobId}/report`, { method: "DELETE" });
}

/**
 * Best-effort record that the user opened this posting, so the "Viewed" badge
 * follows them across devices. Fire-and-forget: it swallows every error and,
 * unlike {@link apiFetch}, never refreshes or redirects on 401 — a background
 * view-ping must never bounce someone mid-click. Local state stays the instant
 * layer (see lib/viewedJobs.ts).
 */
export function markJobViewedRemote(jobId: string): void {
  const token = getToken();
  if (!token) return;
  void fetch(`${API_URL}/api/jobs/${jobId}/view`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});
}

/**
 * Job ids the current user has viewed on any device — hydrates the local set on
 * the jobs page so a fresh device shows prior views immediately.
 */
export function getMyViews(): Promise<{ jobIds: string[] }> {
  return apiFetch<{ jobIds: string[] }>("/api/jobs/views/mine");
}

/**
 * Toggle Save / Applied on a job. Best-effort like {@link markJobViewedRemote}:
 * a bare authed fetch with no 401-refresh/redirect, because these fire from a
 * card tap and must never bounce the user mid-interaction. Unlike the view ping
 * they return the promise so the caller can revert its optimistic state on
 * failure (it swallows nothing — rejection is meaningful, just non-fatal).
 */
function jobAction(
  jobId: string,
  segment: "save" | "applied",
  method: "POST" | "DELETE",
): Promise<void> {
  const token = getToken();
  if (!token) return Promise.reject(new Error("Not authenticated"));
  return fetch(`${API_URL}/api/jobs/${jobId}/${segment}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => {
    if (!res.ok) throw new ApiRequestError(res.status, `Request failed (${res.status})`);
  });
}

/** Bookmark a job (idempotent). */
export const saveJob = (jobId: string) => jobAction(jobId, "save", "POST");
/** Remove a bookmark (idempotent). */
export const unsaveJob = (jobId: string) => jobAction(jobId, "save", "DELETE");
/** Mark a job applied (idempotent). */
export const markApplied = (jobId: string) => jobAction(jobId, "applied", "POST");
/** Un-mark a job applied (idempotent). */
export const unmarkApplied = (jobId: string) => jobAction(jobId, "applied", "DELETE");

/** Bookmarked jobs, newest-saved first; includes CLOSED postings. */
export function getSavedJobs(page = 0, size = 20): Promise<Page<Job>> {
  return apiFetch<Page<Job>>(`/api/jobs/saved?page=${page}&size=${size}`);
}

/** Applied-to jobs, newest-applied first; includes CLOSED postings. */
export function getAppliedJobs(page = 0, size = 20): Promise<Page<Job>> {
  return apiFetch<Page<Job>>(`/api/jobs/applied?page=${page}&size=${size}`);
}

/** Permanently deletes the account (password re-confirmation required). */
export function deleteAccount(password: string): Promise<void> {
  return apiFetch<void>("/api/profile", {
    method: "DELETE",
    body: JSON.stringify({ password }),
  });
}
