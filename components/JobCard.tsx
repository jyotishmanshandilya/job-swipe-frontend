"use client";

import { useEffect, useRef, useState } from "react";
import type { Job } from "@/lib/types";
import {
  markApplied,
  markJobViewedRemote,
  saveJob,
  unsaveJob,
} from "@/lib/api";
import { appliedFlags, savedFlags } from "@/lib/jobFlags";
import { markJobViewed, useViewedJobs } from "@/lib/viewedJobs";
import ReportJobButton from "./ReportJobButton";

export type JobCardMode = "card" | "list";

function yoeLabel(job: Job): string {
  if (job.yearsOfExperience == null) return "Experience not listed";
  if (job.yearsOfExperience === 0) return "Entry level";
  if (job.yoeSource === "TITLE_INFERRED")
    return `~${job.yearsOfExperience} yrs (from title)`;
  return `${job.yearsOfExperience}+ yrs`;
}

function timeAgo(iso: string | null): string | null {
  if (!iso) return null;
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/** Crisp 12px inline icons for metadata chips (emoji render inconsistently). */
function ChipIcon({ kind }: { kind: "pin" | "home" | "briefcase" | "clock" }) {
  const paths = {
    pin: (
      <>
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
    home: (
      <>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
      </>
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  }[kind];
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      {paths}
    </svg>
  );
}

function Chip({
  icon,
  children,
}: {
  icon: "pin" | "home" | "briefcase" | "clock";
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2 py-0.5 text-xs font-bold text-stone-600">
      <ChipIcon kind={icon} />
      {children}
    </span>
  );
}

/** Opens the posting in a new tab and records the view. Softens to an outline
 *  once viewed so the feed reads as "already opened" at a glance. */
function ViewLink({
  url,
  onView,
  viewed,
  compact = false,
}: {
  url: string;
  onView: () => void;
  viewed: boolean;
  compact?: boolean;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onView}
      className={`shrink-0 text-sm font-extrabold ${compact ? "px-3 py-1" : "px-4 py-1.5"}`}
      style={{
        borderRadius: "var(--radius-2xl)",
        boxShadow: "var(--shadow-soft-sm)",
        ...(viewed
          ? { background: "var(--surface-card)", color: "var(--stone-600)", border: "1.5px solid var(--border-default)" }
          : { background: "var(--brand-primary)", color: "var(--brand-primary-text)" }),
      }}
    >
      View
    </a>
  );
}

/** Small check-in-circle used by the "Viewed" badge. */
function ViewedBadge({ compact = false }: { compact?: boolean }) {
  const check = (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
  if (compact) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-stone-500">
        {check}
        Viewed
      </span>
    );
  }
  return (
    <span
      className="absolute -top-2.5 left-4 inline-flex -rotate-2 items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide"
      style={{ background: "var(--stone-100)", color: "var(--stone-600)", boxShadow: "var(--shadow-soft-xs)" }}
    >
      {check}
      Viewed
    </span>
  );
}

/** Bookmark toggle. Filled amber when saved; outline otherwise. */
function SaveButton({
  saved,
  onToggle,
  compact = false,
}: {
  saved: boolean;
  onToggle: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={saved}
      aria-label={saved ? "Remove bookmark" : "Save job"}
      title={saved ? "Saved" : "Save"}
      className={`inline-flex shrink-0 items-center justify-center ${compact ? "px-2.5 py-1" : "px-3 py-1.5"}`}
      style={{
        borderRadius: "var(--radius-2xl)",
        boxShadow: "var(--shadow-soft-sm)",
        cursor: "pointer",
        ...(saved
          ? { background: "var(--amber-200)", color: "var(--amber-950)", border: "1.5px solid var(--amber-400)" }
          : { background: "var(--surface-card)", color: "var(--stone-500)", border: "1.5px solid var(--border-default)" }),
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1z" />
      </svg>
    </button>
  );
}

/** Small "Applied" badge, green to read as a positive endpoint. */
function AppliedBadge({ compact = false }: { compact?: boolean }) {
  const check = (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
  if (compact) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-emerald-700">
        {check}
        Applied
      </span>
    );
  }
  return (
    <span
      className="absolute -top-2.5 left-4 inline-flex -rotate-2 items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide"
      style={{ background: "var(--emerald-100)", color: "var(--emerald-800)", boxShadow: "var(--shadow-soft-xs)" }}
    >
      {check}
      Applied
    </span>
  );
}

/** Lifecycle badge for CLOSED postings in the Saved/Applied lists. */
function ClosedBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-stone-300 bg-stone-100 px-2 py-0.5 text-[11px] font-bold text-stone-500">
      No longer accepting applications
    </span>
  );
}

function Avatar({ job }: { job: Job }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-lg font-extrabold uppercase text-amber-800">
      {(job.companyName ?? job.jobTitle).charAt(0)}
    </div>
  );
}

export default function JobCard({
  job,
  mode = "card",
  onReported,
}: {
  job: Job;
  mode?: JobCardMode;
  /** When set (matched feed), shows the report affordance. */
  onReported?: (jobId: string) => void;
}) {
  const seen = timeAgo(job.firstSeenAt);
  const isNew = seen === "today" || seen === "yesterday";
  const isClosed = job.status === "CLOSED";

  // Server-truth `viewed` (once the backend surfaces it) OR-ed with the local
  // record, so a just-clicked card shows the badge instantly.
  const viewed = useViewedJobs().has(job.id) || Boolean(job.viewed);

  // Save / Applied: the local override map wins over the DTO so an optimistic
  // toggle reads back instantly; falls through to the server truth otherwise.
  const savedOverride = savedFlags.useFlags().get(job.id);
  const saved = savedOverride ?? Boolean(job.saved);
  const appliedOverride = appliedFlags.useFlags().get(job.id);
  const applied = appliedOverride ?? Boolean(job.applied);

  const toggleSaved = () => {
    const next = !saved;
    savedFlags.set(job.id, next); // optimistic
    (next ? saveJob(job.id) : unsaveJob(job.id)).catch(() =>
      savedFlags.set(job.id, !next), // revert on failure
    );
  };

  const confirmApplied = () => {
    appliedFlags.set(job.id, true); // optimistic
    markApplied(job.id).catch(() => {}); // best-effort; keep the optimistic mark
    setApplyPrompt(false);
  };

  // "Did you apply?" prompt: after View opens the posting in a new tab, our tab
  // goes hidden; when it becomes visible again we ask once (unless already
  // applied). A ref carries the "pending" flag so the visibility listener,
  // registered once, reads the latest intent without re-subscribing.
  const [applyPrompt, setApplyPrompt] = useState(false);
  const pendingApply = useRef(false);
  const appliedRef = useRef(applied);
  useEffect(() => {
    appliedRef.current = applied;
  }, [applied]);

  useEffect(() => {
    const onVisible = () => {
      if (
        document.visibilityState === "visible" &&
        pendingApply.current &&
        !appliedRef.current
      ) {
        pendingApply.current = false;
        setApplyPrompt(true);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  // Local-first for an instant Viewed badge; the remote ping is best-effort and
  // durable. Arm the apply prompt only when not already applied (don't re-nag).
  const onView = () => {
    markJobViewed(job.id);
    markJobViewedRemote(job.id);
    if (!appliedRef.current) pendingApply.current = true;
  };

  // Inline confirm bar shared by both layouts.
  const applyPromptBar = applyPrompt ? (
    <div className="mt-3 flex items-center gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-3 py-2">
      <p className="min-w-0 flex-1 truncate text-sm font-bold text-emerald-900">
        Did you apply?
      </p>
      <button
        type="button"
        onClick={confirmApplied}
        className="shrink-0 rounded-lg px-3 py-0.5 text-sm font-extrabold text-white"
        style={{ background: "var(--emerald-700)", boxShadow: "var(--shadow-soft-xs)", cursor: "pointer" }}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => setApplyPrompt(false)}
        aria-label="Dismiss"
        className="shrink-0 text-lg font-bold text-emerald-700/60 hover:text-emerald-900"
      >
        ×
      </button>
    </div>
  ) : null;

  if (mode === "list") {
    // Dense row: title · company · one key chip + View. Truncation is fine here;
    // the full detail lives in card mode.
    return (
      <div>
        <div
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5"
          style={{ background: "var(--surface-card)", boxShadow: "var(--shadow-soft-sm)" }}
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">
              <span className="font-extrabold text-stone-800">{job.jobTitle}</span>
              {job.companyName && (
                <span className="font-semibold capitalize text-stone-500">
                  {" "}
                  · {job.companyName}
                </span>
              )}
            </p>
            {isClosed && (
              <span className="mt-0.5 block text-[11px] font-bold text-stone-400">
                No longer accepting applications
              </span>
            )}
          </div>
          {applied ? (
            <AppliedBadge compact />
          ) : viewed ? (
            <ViewedBadge compact />
          ) : (
            isNew && (
              <span className="hidden shrink-0 rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-teal-700 sm:inline">
                New
              </span>
            )
          )}
          <span className="hidden shrink-0 sm:inline-flex">
            <Chip icon="pin">{job.location ?? "Location not listed"}</Chip>
          </span>
          {onReported && (
            <span className="hidden shrink-0 sm:inline-flex">
              <ReportJobButton job={job} onReported={onReported} />
            </span>
          )}
          <SaveButton saved={saved} onToggle={toggleSaved} compact />
          <ViewLink
            url={job.applicationUrl}
            onView={onView}
            viewed={viewed}
            compact
          />
        </div>
        {applyPromptBar}
      </div>
    );
  }

  return (
    <div
      className="relative flex h-full flex-col rounded-3xl p-4 transition-transform hover:-translate-y-0.5"
      style={{ background: "var(--surface-card)", boxShadow: "var(--shadow-soft-sm)" }}
    >
      {applied ? <AppliedBadge /> : viewed && <ViewedBadge />}
      {isNew && !applied && (
        <span
          className="absolute -top-2.5 right-4 rotate-2 rounded-lg px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide"
          style={{ background: "var(--amber-300)", color: "var(--amber-950)", boxShadow: "var(--shadow-soft-xs)" }}
        >
          new tonight
        </span>
      )}
      <div className="flex items-start gap-3.5">
        <Avatar job={job} />
        <div className="min-w-0 flex-1">
          {/* title wraps — no truncation in card mode */}
          <h3 className="text-base font-extrabold leading-snug text-stone-800">
            {job.jobTitle}
          </h3>
          {job.companyName && (
            <p className="mt-0.5 text-sm font-bold capitalize text-stone-500">
              {job.companyName}
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Chip icon="pin">{job.location ?? "Location not listed"}</Chip>
        {job.workplaceType && <Chip icon="home">{job.workplaceType}</Chip>}
        <Chip icon="briefcase">{yoeLabel(job)}</Chip>
        {isClosed && <ClosedBadge />}
      </div>
      <div className="mt-4 flex flex-1 items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="inline-flex items-center gap-1 text-xs font-semibold text-stone-400">
            {seen && (
              <>
                <ChipIcon kind="clock" />
                Spotted {seen}
              </>
            )}
          </p>
          {onReported && <ReportJobButton job={job} onReported={onReported} />}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <SaveButton saved={saved} onToggle={toggleSaved} />
          <ViewLink url={job.applicationUrl} onView={onView} viewed={viewed} />
        </div>
      </div>
      {applyPromptBar}
    </div>
  );
}
