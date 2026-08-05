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

  // Browse filters (applied on submit, not on each keystroke)
  const [titleFilter, setTitleFilter] = useState(searchParams.get("title") ?? "");
  const [locationFilter, setLocationFilter] = useState(
    searchParams.get("location") ?? "",
  );
  const [applied, setApplied] = useState({
    title: searchParams.get("title") ?? "",
    location: searchParams.get("location") ?? "",
  });

  const queryKey = `${tab}|${page}|${applied.title}|${applied.location}`;

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
    if (tab === "all") params.set("tab", "all");
    if (page > 0) params.set("page", String(page));
    if (applied.title) params.set("title", applied.title);
    if (applied.location) params.set("location", applied.location);
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
        let path: string;
        if (tab === "matched") {
          path = `/api/jobs/matched?page=${page}&size=20`;
        } else {
          const params = new URLSearchParams({ page: String(page), size: "20" });
          if (applied.title) params.set("title", applied.title);
          if (applied.location) params.set("location", applied.location);
          path = `/api/jobs?${params}`;
        }
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
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(0);
            setApplied({ title: titleFilter, location: locationFilter });
          }}
        >
          <Input
            placeholder="Title contains…"
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
          />
          <Input
            placeholder="Location contains…"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
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
