"use client";

import { useSyncExternalStore } from "react";
import type { JobCardMode } from "./JobCard";

// Legacy prefix kept for consistency with the auth keys (see lib/api.ts).
const STORAGE_KEY = "jobswipe_jobview";

// Tiny external store over localStorage, read via useSyncExternalStore: the
// server snapshot is "card" (the default — including first visit) and React
// swaps in the stored client value right after hydration. No mismatch, no
// setState-in-effect.
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};
const getSnapshot = (): JobCardMode =>
  localStorage.getItem(STORAGE_KEY) === "list" ? "list" : "card";
const getServerSnapshot = (): JobCardMode => "card";

/** Card ⁄ list view preference, persisted to localStorage. Card is the default. */
export function useJobView(): [JobCardMode, (m: JobCardMode) => void] {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const update = (m: JobCardMode) => {
    localStorage.setItem(STORAGE_KEY, m);
    listeners.forEach((cb) => cb());
  };
  return [mode, update];
}

/** Segmented card ⁄ list control, styled to sit beside the feed tabs. */
export default function JobViewToggle({
  mode,
  onChange,
}: {
  mode: JobCardMode;
  onChange: (m: JobCardMode) => void;
}) {
  const btn = (m: JobCardMode, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      aria-label={`${label} view`}
      aria-pressed={mode === m}
      onClick={() => onChange(m)}
      className={`cursor-pointer rounded-full px-2.5 py-1.5 transition-colors ${
        mode === m
          ? "bg-amber-100 text-amber-900"
          : "text-stone-400 hover:text-stone-700"
      }`}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex items-center gap-0.5 rounded-full border-2 border-stone-200 bg-white p-0.5">
      {btn(
        "card",
        "Card",
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <rect x="3" y="3" width="8" height="8" rx="2" />
          <rect x="13" y="3" width="8" height="8" rx="2" />
          <rect x="3" y="13" width="8" height="8" rx="2" />
          <rect x="13" y="13" width="8" height="8" rx="2" />
        </svg>
      )}
      {btn(
        "list",
        "List",
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )}
    </div>
  );
}
