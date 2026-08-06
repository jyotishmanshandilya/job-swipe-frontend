"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import JobCard from "@/components/JobCard";
import OwlMascot from "@/components/OwlMascot";
import { Alert, Button, Spinner } from "@/components/ui";
import { ApiRequestError, getAppliedJobs, getSavedJobs } from "@/lib/api";
import type { Job, Page } from "@/lib/types";

type Tab = "saved" | "applied";

/** Outcome of one fetch, tagged with the query it answered. */
interface LoadResult {
  key: string;
  data: Page<Job> | null;
  error: string | null;
}

function InventoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>(
    searchParams.get("tab") === "applied" ? "applied" : "saved",
  );
  const [page, setPage] = useState(
    Math.max(0, Number(searchParams.get("page")) || 0),
  );
  const [result, setResult] = useState<LoadResult | null>(null);

  const queryKey = `${tab}|${page}`;

  useEffect(() => {
    const params = new URLSearchParams();
    if (tab === "applied") params.set("tab", "applied");
    if (page > 0) params.set("page", String(page));
    const qs = params.toString();
    router.replace(qs ? `/saved?${qs}` : "/saved", { scroll: false });
  }, [tab, page, router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next: LoadResult = { key: queryKey, data: null, error: null };
      try {
        next.data =
          tab === "saved"
            ? await getSavedJobs(page, 20)
            : await getAppliedJobs(page, 20);
      } catch (err) {
        next.error =
          err instanceof ApiRequestError ? err.message : "Failed to load jobs";
      }
      if (!cancelled) setResult(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [queryKey, tab, page]);

  const loading = result?.key !== queryKey;
  const data = loading ? null : result!.data;
  const error = loading ? null : result!.error;

  const switchTab = (t: Tab) => {
    setTab(t);
    setPage(0);
  };

  const emptyCopy =
    tab === "saved"
      ? "Nothing saved yet. Tap the bookmark on any job to keep it here."
      : "No applications tracked yet. After you view a role, tell the owl if you applied.";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-stone-800">My jobs</h1>
        <div className="flex rounded-full border-2 border-stone-200 bg-white p-1">
          {(["saved", "applied"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-extrabold transition-colors ${
                tab === t
                  ? "bg-amber-400 text-amber-950"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              {t === "saved" ? "Saved" : "Applied"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : error ? (
          <Alert kind="error">{error}</Alert>
        ) : !data || data.content.length === 0 ? (
          <div className="rise rounded-2xl border-2 border-dashed border-stone-300 bg-white p-8 text-center">
            <div className="flex justify-center">
              <OwlMascot size={80} variant="sleepy" className="owl-snooze" />
            </div>
            <p className="mx-auto mt-4 max-w-sm text-sm font-semibold text-stone-500">
              {emptyCopy}
            </p>
            <Link
              href="/jobs"
              className="mt-5 inline-block rounded-2xl border-2 border-b-4 border-amber-600 bg-amber-400 px-5 py-2 text-sm font-extrabold text-amber-950 shadow-hard-sm transition-all hover:bg-amber-300 active:translate-y-[2px] active:border-b-2 active:shadow-hard-xs"
            >
              Browse jobs
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm font-semibold text-stone-500">
              {data.totalElements.toLocaleString()}{" "}
              {tab === "saved" ? "saved" : "applied to"}
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {data.content.map((job, i) => (
                <div
                  key={job.id}
                  className="rise h-full"
                  style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                >
                  <JobCard job={job} mode="card" />
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
    </div>
  );
}

export default function SavedPage() {
  return (
    <RequireAuth>
      {/* useSearchParams needs Suspense or the production build fails. */}
      <Suspense fallback={<Spinner />}>
        <InventoryContent />
      </Suspense>
    </RequireAuth>
  );
}
