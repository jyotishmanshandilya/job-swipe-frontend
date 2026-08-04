"use client";

import { useSyncExternalStore } from "react";

// Legacy prefix kept for consistency with the auth/view-mode keys (lib/api.ts,
// JobViewToggle). Stores the set of job IDs the user has opened via "View".
// Local-first: instant UX with no round-trip. The backend is expected to also
// persist views and surface `Job.viewed` (see BACKEND_HANDOFF.md) — when that
// lands, a server-true `viewed` is OR-ed with this local set in JobCard, so the
// two layers coexist without a migration.
const STORAGE_KEY = "jobswipe_viewed";

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

function read(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

// useSyncExternalStore needs a referentially-stable snapshot: rebuild the Set
// only when the stored string actually changes, otherwise return the cached one.
let cachedRaw: string | null = null;
let cachedSet = new Set<string>();
const getSnapshot = (): Set<string> => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSet = read();
  }
  return cachedSet;
};
const EMPTY = new Set<string>();
const getServerSnapshot = (): Set<string> => EMPTY;

/** Record a job as viewed and notify every mounted card. No-op if already set. */
export function markJobViewed(id: string) {
  const set = read();
  if (set.has(id)) return;
  set.add(id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // storage unavailable (private mode / quota) — the in-memory listeners
    // still fire, so the badge shows for this session.
  }
  listeners.forEach((cb) => cb());
}

/**
 * Merge server-known viewed IDs into the local set (called once on mount from
 * the jobs page, from GET /api/jobs/views/mine). Additive — never drops a
 * local-only view — and notifies mounted cards only when something changed, so
 * a no-op hydrate causes no re-render.
 */
export function hydrateViewedJobs(ids: string[]) {
  if (ids.length === 0) return;
  const set = read();
  let changed = false;
  for (const id of ids) {
    if (!set.has(id)) {
      set.add(id);
      changed = true;
    }
  }
  if (!changed) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // storage unavailable — in-memory listeners still refresh for this session.
  }
  listeners.forEach((cb) => cb());
}

/** The set of locally-viewed job IDs, reactive across all cards. */
export function useViewedJobs(): Set<string> {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
