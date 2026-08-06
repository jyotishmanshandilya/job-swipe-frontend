"use client";

import { useSyncExternalStore } from "react";

/**
 * Local-first per-job boolean overrides for Save / Applied, mirroring
 * lib/viewedJobs.ts but supporting toggle-*off* (viewed is add-only).
 *
 * The backend DTO carries the durable, cross-device truth (`job.saved` /
 * `job.applied`) on every fetch. This store is the *instant* layer: an
 * optimistic override the user set this session that wins over the DTO until
 * the next fetch. A card reads `flags.get(id) ?? Boolean(job.saved)`, so an
 * un-save reads back as false immediately (which a plain OR-with-a-Set could
 * not express). Persisted so a card mounted after navigation stays consistent.
 *
 * Legacy `jobswipe_` key prefix kept for consistency with the auth/view keys.
 */
type FlagMap = Map<string, boolean>;

function createJobFlag(storageKey: string) {
  const listeners = new Set<() => void>();
  const subscribe = (cb: () => void) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  };

  function read(): FlagMap {
    try {
      const raw = localStorage.getItem(storageKey);
      return new Map(raw ? (JSON.parse(raw) as [string, boolean][]) : []);
    } catch {
      return new Map();
    }
  }

  // Referentially-stable snapshot for useSyncExternalStore: rebuild only when
  // the stored string actually changes.
  let cachedRaw: string | null = null;
  let cachedMap: FlagMap = new Map();
  const getSnapshot = (): FlagMap => {
    const raw = localStorage.getItem(storageKey);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedMap = read();
    }
    return cachedMap;
  };
  const EMPTY: FlagMap = new Map();
  const getServerSnapshot = (): FlagMap => EMPTY;

  /** Record the user's optimistic choice and notify every mounted card. */
  function set(id: string, value: boolean) {
    const map = read();
    if (map.get(id) === value) return;
    map.set(id, value);
    try {
      localStorage.setItem(storageKey, JSON.stringify([...map]));
    } catch {
      // storage unavailable (private mode / quota) — in-memory listeners still
      // fire, so the toggle reflects for this session.
    }
    listeners.forEach((cb) => cb());
  }

  /** Reactive override map, keyed by job id. */
  function useFlags(): FlagMap {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  }

  return { set, useFlags };
}

export const savedFlags = createJobFlag("jobswipe_saved");
export const appliedFlags = createJobFlag("jobswipe_applied");
