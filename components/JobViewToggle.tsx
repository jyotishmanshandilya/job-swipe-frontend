"use client";

import { useEffect, useState } from "react";
import type { JobCardMode } from "./JobCard";

// Legacy prefix kept for consistency with the auth keys (see lib/api.ts).
const STORAGE_KEY = "jobswipe_jobview";

/**
 * Card ⁄ list view preference, persisted to localStorage. Card is the default —
 * including first visit — so we render "card" on the server and only swap after
 * mount if a stored preference disagrees (avoids a hydration mismatch).
 */
export function useJobView(): [JobCardMode, (m: JobCardMode) => void] {
  const [mode, setMode] = useState<JobCardMode>("card");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "list") setMode("list");
  }, []);

  const update = (m: JobCardMode) => {
    setMode(m);
    localStorage.setItem(STORAGE_KEY, m);
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
