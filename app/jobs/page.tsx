"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import JobCard from "@/components/JobCard";
import JobViewToggle, { useJobView } from "@/components/JobViewToggle";
import OwlMascot from "@/components/OwlMascot";
import { Squiggle } from "@/components/Doodles";
import { Alert, Button, Input, Spinner } from "@/components/ui";
import { apiFetch, ApiRequestError, getMyViews, unreportJob } from "@/lib/api";
import { hydrateViewedJobs } from "@/lib/viewedJobs";
import type { Job, Page } from "@/lib/types";

type Tab = "matched" | "all";

/** Ephemeral Browse filters (URL-backed, never persisted to preferences). */
interface Filters {
  title: string;
  location: string;
  company: string;
  workplaceType: string[]; // remote / hybrid / onsite (multi)
  yoeMin: string; // kept as string so an empty input means "no constraint"
  yoeMax: string;
  since: "" | "24h" | "7d" | "30d";
}
/** The subset staged in inputs until the user hits Search. */
type StagedFilters = Pick<
  Filters,
  "title" | "location" | "company" | "yoeMin" | "yoeMax"
>;

const EMPTY_FILTERS: Filters = {
  title: "",
  location: "",
  company: "",
  workplaceType: [],
  yoeMin: "",
  yoeMax: "",
  since: "",
};

const WORKPLACE_OPTIONS = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];
const SINCE_OPTIONS = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
];

function filtersFromParams(params: URLSearchParams): Filters {
  const since = params.get("since") ?? "";
  return {
    title: params.get("title") ?? "",
    location: params.get("location") ?? "",
    company: params.get("company") ?? "",
    workplaceType: params.getAll("workplaceType"),
    yoeMin: params.get("yoeMin") ?? "",
    yoeMax: params.get("yoeMax") ?? "",
    since: (["24h", "7d", "30d"].includes(since) ? since : "") as Filters["since"],
  };
}

/** Serializes filters back into the shareable URL (recency stays a preset). */
function writeFiltersToParams(f: Filters, params: URLSearchParams) {
  if (f.title) params.set("title", f.title);
  if (f.location) params.set("location", f.location);
  if (f.company) params.set("company", f.company);
  for (const w of f.workplaceType) params.append("workplaceType", w);
  if (f.yoeMin) params.set("yoeMin", f.yoeMin);
  if (f.yoeMax) params.set("yoeMax", f.yoeMax);
  if (f.since) params.set("since", f.since);
}

const SINCE_MS: Record<string, number> = {
  "24h": 86_400_000,
  "7d": 7 * 86_400_000,
  "30d": 30 * 86_400_000,
};

/** Builds the GET /api/jobs request path, expanding `since` to firstSeenAfter. */
function buildBrowsePath(page: number, f: Filters): string {
  const params = new URLSearchParams({ page: String(page), size: "20" });
  if (f.title) params.set("title", f.title);
  if (f.location) params.set("location", f.location);
  if (f.company) params.set("company", f.company);
  for (const w of f.workplaceType) params.append("workplaceType", w);
  if (f.yoeMin) params.set("yoeMin", f.yoeMin);
  if (f.yoeMax) params.set("yoeMax", f.yoeMax);
  const ms = SINCE_MS[f.since];
  if (ms) params.set("firstSeenAfter", new Date(Date.now() - ms).toISOString());
  return `/api/jobs?${params}`;
}

function isAnyFilterActive(f: Filters): boolean {
  return Boolean(
    f.title ||
      f.location ||
      f.company ||
      f.workplaceType.length ||
      f.yoeMin ||
      f.yoeMax ||
      f.since,
  );
}

/** Outcome of one fetch, tagged with the query it answered. */
interface LoadResult {
  key: string;
  data: Page<Job> | null;
  error: string | null;
  noPreferences: boolean;
}

function JobsContent() {
  // Tab/page/filters live in the URL so leaving and coming back (or sharing
  // the link) restores the same view. State stays the source of truth while
  // on the page; the URL is synced via replace() below.
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>(
    searchParams.get("tab") === "all" ? "all" : "matched",
  );
  const [page, setPage] = useState(
    Math.max(0, Number(searchParams.get("page")) || 0),
  );
  const [result, setResult] = useState<LoadResult | null>(null);
  const [view, setView] = useJobView();

  // Browse filters. Text/number fields commit on submit; workplace + recency
  // toggles commit immediately. All ephemeral — they live in the URL only, never
  // in saved preferences (the whole point is refining without disturbing "For
  // you"). `applied` is the committed truth used for fetch + URL; `staged` holds
  // the text/number inputs until Search.
  const [applied, setApplied] = useState<Filters>(() => filtersFromParams(searchParams));
  const [staged, setStaged] = useState<StagedFilters>(() => {
    const f = filtersFromParams(searchParams);
    return {
      title: f.title,
      location: f.location,
      company: f.company,
      yoeMin: f.yoeMin,
      yoeMax: f.yoeMax,
    };
  });

  const filterKey = JSON.stringify(applied);
  const queryKey = tab === "matched" ? `matched|${page}` : `all|${page}|${filterKey}`;

  const commitStaged = () => {
    setPage(0);
    setApplied((prev) => ({ ...prev, ...staged }));
  };
  // Immediate-apply helper for the toggle controls.
  const patchApplied = (patch: Partial<Filters>) => {
    setPage(0);
    setApplied((prev) => ({ ...prev, ...patch }));
  };
  const toggleWorkplace = (w: string) =>
    patchApplied({
      workplaceType: applied.workplaceType.includes(w)
        ? applied.workplaceType.filter((x) => x !== w)
        : [...applied.workplaceType, w],
    });
  const clearFilters = () => {
    setPage(0);
    setApplied(EMPTY_FILTERS);
    setStaged({ title: "", location: "", company: "", yoeMin: "", yoeMax: "" });
  };
  const hasActiveFilters = isAnyFilterActive(applied);

  // Hydrate the local "viewed" set from the server once on mount, so a fresh
  // device shows previously-viewed badges. Best-effort: a failure just leaves
  // the local set untouched.
  useEffect(() => {
    let cancelled = false;
    getMyViews()
      .then((res) => {
        if (!cancelled) hydrateViewedJobs(res.jobIds);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (tab === "all") {
      params.set("tab", "all");
      writeFiltersToParams(applied, params);
    }
    if (page > 0) params.set("page", String(page));
    const qs = params.toString();
    router.replace(qs ? `/jobs?${qs}` : "/jobs", { scroll: false });
  }, [tab, page, applied, router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next: LoadResult = {
        key: queryKey,
        data: null,
        error: null,
        noPreferences: false,
      };
      try {
        const path =
          tab === "matched"
            ? `/api/jobs/matched?page=${page}&size=20`
            : buildBrowsePath(page, applied);
        next.data = await apiFetch<Page<Job>>(path);
      } catch (err) {
        if (err instanceof ApiRequestError && err.status === 404 && tab === "matched") {
          // No preferences saved yet.
          next.noPreferences = true;
        } else {
          next.error =
            err instanceof ApiRequestError ? err.message : "Failed to load jobs";
        }
      }
      if (!cancelled) setResult(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [queryKey, tab, page, applied]);

  // Loading whenever the stored result doesn't answer the current query yet.
  const loading = result?.key !== queryKey;
  const data = loading ? null : result!.data;
  const error = loading ? null : result!.error;
  const noPreferences = loading ? false : result!.noPreferences;

  const switchTab = (t: Tab) => {
    setTab(t);
    setPage(0);
  };

  // Undo window after a report: the removed card is kept (with its position)
  // for a few seconds so a mistaken report can be reverted in one click. The
  // toast is tagged with the query it belongs to, so switching tab/page/filter
  // hides it without any state juggling.
  const [undo, setUndo] = useState<{ job: Job; index: number; key: string } | null>(null);
  const [undoBusy, setUndoBusy] = useState(false);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (undoTimer.current) clearTimeout(undoTimer.current);
    };
  }, []);

  const dismissUndo = () => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = null;
    setUndo(null);
  };

  // The backend already excludes reported jobs from the next fetch; dropping
  // the card locally just avoids a full refetch.
  const handleReported = (jobId: string) => {
    setResult((prev) => {
      if (!prev?.data) return prev;
      const index = prev.data.content.findIndex((j) => j.id === jobId);
      if (index === -1) return prev;
      if (undoTimer.current) clearTimeout(undoTimer.current);
      setUndo({ job: prev.data.content[index], index, key: queryKey });
      undoTimer.current = setTimeout(() => setUndo(null), 8000);
      return {
        ...prev,
        data: {
          ...prev.data,
          content: prev.data.content.filter((j) => j.id !== jobId),
          totalElements: Math.max(0, prev.data.totalElements - 1),
        },
      };
    });
  };

  const performUndo = async () => {
    if (!undo || undoBusy) return;
    setUndoBusy(true);
    try {
      await unreportJob(undo.job.id);
      setResult((prev) => {
        if (!prev?.data) return prev;
        const content = [...prev.data.content];
        content.splice(Math.min(undo.index, content.length), 0, undo.job);
        return {
          ...prev,
          data: {
            ...prev.data,
            content,
            totalElements: prev.data.totalElements + 1,
          },
        };
      });
      dismissUndo();
    } catch {
      // Leave the toast up so the user can retry.
    } finally {
      setUndoBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-stone-800">Jobs</h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full border-2 border-stone-200 bg-white p-1">
            {(["matched", "all"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-extrabold transition-colors ${
                  tab === t
                    ? "bg-amber-400 text-amber-950"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {t === "matched" ? "For you" : "Browse all"}
              </button>
            ))}
          </div>
          <JobViewToggle mode={view} onChange={setView} />
        </div>
      </div>

      {tab === "all" && (
        <div className="mt-4 rounded-2xl border-2 border-stone-200 bg-white p-3">
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              commitStaged();
            }}
          >
            <Input
              placeholder="Title contains…"
              value={staged.title}
              onChange={(e) => setStaged({ ...staged, title: e.target.value })}
            />
            <Input
              placeholder="Company contains…"
              value={staged.company}
              onChange={(e) => setStaged({ ...staged, company: e.target.value })}
            />
            <Input
              placeholder="Location contains…"
              value={staged.location}
              onChange={(e) => setStaged({ ...staged, location: e.target.value })}
            />
            <Button type="submit" variant="secondary" className="shrink-0">
              Search
            </Button>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            {/* Workplace type — multi-select, applies immediately */}
            <div className="flex items-center gap-1.5">
              {WORKPLACE_OPTIONS.map((w) => {
                const on = applied.workplaceType.includes(w.value);
                return (
                  <button
                    key={w.value}
                    type="button"
                    onClick={() => toggleWorkplace(w.value)}
                    aria-pressed={on}
                    className={`cursor-pointer rounded-full border-2 px-3 py-1 text-xs font-extrabold transition-colors ${
                      on
                        ? "border-amber-500 bg-amber-100 text-amber-800"
                        : "border-stone-200 bg-white text-stone-500 hover:border-stone-300"
                    }`}
                  >
                    {w.label}
                  </button>
                );
              })}
            </div>

            {/* Years of experience — commits on Search with the text fields */}
            <form
              className="flex items-center gap-1.5"
              onSubmit={(e) => {
                e.preventDefault();
                commitStaged();
              }}
            >
              <span className="text-xs font-bold text-stone-500">YoE</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="min"
                value={staged.yoeMin}
                onChange={(e) => setStaged({ ...staged, yoeMin: e.target.value })}
                className="w-16 rounded-lg border-2 border-stone-200 bg-white px-2 py-1 text-xs font-bold outline-none focus:border-amber-400"
              />
              <span className="text-xs font-bold text-stone-400">–</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="max"
                value={staged.yoeMax}
                onChange={(e) => setStaged({ ...staged, yoeMax: e.target.value })}
                className="w-16 rounded-lg border-2 border-stone-200 bg-white px-2 py-1 text-xs font-bold outline-none focus:border-amber-400"
              />
            </form>

            {/* Recency — single-select presets, applies immediately */}
            <div className="flex items-center gap-1.5">
              {SINCE_OPTIONS.map((s) => {
                const on = applied.since === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() =>
                      patchApplied({ since: on ? "" : (s.value as Filters["since"]) })
                    }
                    aria-pressed={on}
                    className={`cursor-pointer rounded-full border-2 px-3 py-1 text-xs font-extrabold transition-colors ${
                      on
                        ? "border-teal-500 bg-teal-100 text-teal-800"
                        : "border-stone-200 bg-white text-stone-500 hover:border-stone-300"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="cursor-pointer text-xs font-extrabold text-stone-400 underline decoration-dotted underline-offset-2 hover:text-stone-600"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : noPreferences ? (
          <div className="rise rounded-2xl border-2 border-dashed border-stone-300 bg-white p-8 text-center">
            <div className="flex justify-center">
              <OwlMascot size={80} />
            </div>
            <p className="mt-4 font-extrabold text-stone-700">
              Tell the owl what to hunt
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm font-semibold text-stone-500">
              Set your job preferences to unlock personalised matches and the
              daily email digest.
            </p>
            <Link
              href="/onboarding"
              className="mt-5 inline-block rounded-2xl border-2 border-b-4 border-amber-600 bg-amber-400 px-5 py-2 text-sm font-extrabold text-amber-950 shadow-hard-sm transition-all hover:bg-amber-300 active:translate-y-[2px] active:border-b-2 active:shadow-hard-xs"
            >
              Set preferences
            </Link>
          </div>
        ) : error ? (
          <Alert kind="error">{error}</Alert>
        ) : !data || data.content.length === 0 ? (
          <div className="rise rounded-2xl border-2 border-dashed border-stone-300 bg-white p-8 text-center">
            <div className="flex justify-center">
              <OwlMascot size={80} variant="sleepy" className="owl-snooze" />
            </div>
            <p className="mx-auto mt-4 max-w-sm text-sm font-semibold text-stone-500">
              {tab === "matched"
                ? "The owl found nothing new for you — it hunts every night, so check back tomorrow or broaden your preferences."
                : "Even the owl came back empty-taloned for those filters. Loosen the search a little?"}
            </p>
            <span className="mt-3 inline-block text-amber-400">
              <Squiggle size={44} />
            </span>
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm font-semibold text-stone-500">
              {data.totalElements.toLocaleString()} job
              {data.totalElements === 1 ? "" : "s"}
              {tab === "matched" ? " matching your profile" : ""}
            </p>
            <div
              className={
                view === "card"
                  ? "grid grid-cols-1 gap-4 md:grid-cols-2"
                  : "space-y-3"
              }
            >
              {data.content.map((job, i) => (
                <div
                  key={job.id}
                  className="rise h-full"
                  style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                >
                  <JobCard
                    job={job}
                    mode={view}
                    onReported={tab === "matched" ? handleReported : undefined}
                  />
                </div>
              ))}
            </div>
            {data.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <Button
                  variant="secondary"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  ← Previous
                </Button>
                <span className="text-sm font-bold text-stone-500">
                  Page {data.number + 1} of {data.totalPages}
                </span>
                <Button
                  variant="secondary"
                  disabled={page + 1 >= data.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {undo && undo.key === queryKey && (
        <div className="rise fixed bottom-6 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border-2 border-stone-800/90 bg-stone-800 px-4 py-3 shadow-lg">
          <p className="min-w-0 flex-1 truncate text-sm font-bold text-[#FFF8ED]">
            Reported{" "}
            <span className="font-extrabold text-amber-300">
              {undo.job.jobTitle}
            </span>
          </p>
          <button
            type="button"
            onClick={performUndo}
            disabled={undoBusy}
            className="shrink-0 cursor-pointer rounded-xl border-2 border-b-4 border-amber-600 bg-amber-400 px-3 py-1 text-sm font-extrabold text-amber-950 shadow-hard-sm transition-all hover:bg-amber-300 active:translate-y-[2px] active:border-b-2 active:shadow-hard-xs disabled:bg-amber-200"
          >
            {undoBusy ? "Undoing…" : "Undo"}
          </button>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={dismissUndo}
            className="shrink-0 cursor-pointer text-lg font-bold text-stone-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default function JobsPage() {
  return (
    <RequireAuth>
      {/* useSearchParams needs Suspense or the production build fails. */}
      <Suspense fallback={<Spinner />}>
        <JobsContent />
      </Suspense>
    </RequireAuth>
  );
}
