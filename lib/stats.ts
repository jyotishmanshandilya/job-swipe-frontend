import type { JobStats } from "./types";
import { API_URL } from "./api";

/**
 * "N+" claim from an exact count: floored to the step so the number is always
 * true (25,431 jobs → "25,000+"). Falls back to the exact count below one step.
 */
export function plusLabel(count: number, step: number): string {
  if (count < step) return count.toLocaleString();
  return `${(Math.floor(count / step) * step).toLocaleString()}+`;
}

/**
 * Server-side, ISR-cached (hourly) counts for the landing page. Returns null if
 * the backend is unreachable so the render falls back to static copy instead of
 * failing — and, crucially, so the numbers Googlebot indexes are the real DB
 * values (server-rendered) rather than the client-side fallback strings.
 */
export async function fetchJobStats(): Promise<JobStats | null> {
  try {
    const res = await fetch(`${API_URL}/api/jobs/stats`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as JobStats;
  } catch {
    return null;
  }
}
