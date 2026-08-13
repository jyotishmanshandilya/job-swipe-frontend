"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import JobCard from "@/components/JobCard";
import OwlMascot from "@/components/OwlMascot";
import { Alert, Button, Spinner } from "@/components/ds";
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
    <div className="rds mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)", letterSpacing: "var(--tracking-tight)" }}>My jobs</h1>
        <div className="flex rounded-full p-1" style={{ background: "var(--surface-card)", boxShadow: "var(--shadow-soft-xs)" }}>
          {(["saved", "applied"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className="cursor-pointer rounded-full px-4 py-1.5 text-sm font-extrabold"
              style={tab === t ? { background: "var(--brand-primary)", color: "var(--brand-primary-text)" } : { color: "var(--stone-500)" }}
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
          <div
            className="rise rounded-2xl p-8 text-center"
            style={{ background: "var(--surface-card)", border: "1.5px dashed var(--border-default)" }}
          >
            <div className="flex justify-center">
              <OwlMascot size={80} variant="sleepy" className="owl-snooze" />
            </div>
            <p className="mx-auto mt-4 max-w-sm text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
              {emptyCopy}
            </p>
            <Link
              href="/jobs"
              className="mt-5 inline-block text-sm font-extrabold"
              style={{ borderRadius: "var(--radius-2xl)", background: "var(--brand-primary)", color: "var(--brand-primary-text)", padding: "10px 20px", boxShadow: "var(--shadow-soft-sm)" }}
            >
              Browse jobs
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
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
                <span className="text-sm font-bold" style={{ color: "var(--text-muted)" }}>
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
      <Suspense fallback={<div className="rds"><Spinner /></div>}>
        <InventoryContent />
      </Suspense>
    </RequireAuth>
  );
}
