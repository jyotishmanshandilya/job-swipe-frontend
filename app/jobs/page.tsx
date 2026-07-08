"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import JobCard from "@/components/JobCard";
import { Alert, Button, Input, Spinner } from "@/components/ui";
import { apiFetch, ApiRequestError } from "@/lib/api";
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
  const [tab, setTab] = useState<Tab>("matched");
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<LoadResult | null>(null);

  // Browse filters (applied on submit, not on each keystroke)
  const [titleFilter, setTitleFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [applied, setApplied] = useState({ title: "", location: "" });

  const queryKey = `${tab}|${page}|${applied.title}|${applied.location}`;

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

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
        <div className="flex rounded-md border border-gray-200 bg-white p-0.5">
          {(["matched", "all"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`rounded px-4 py-1.5 text-sm font-medium ${
                tab === t
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t === "matched" ? "For you" : "Browse all"}
            </button>
          ))}
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
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
            <p className="text-gray-700 font-medium">
              Tell us what you&apos;re looking for
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Set your job preferences to unlock personalised matches and the
              daily email digest.
            </p>
            <Link
              href="/onboarding"
              className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Set preferences
            </Link>
          </div>
        ) : error ? (
          <Alert kind="error">{error}</Alert>
        ) : !data || data.content.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
            {tab === "matched"
              ? "No matches right now — new jobs are aggregated nightly, so check back tomorrow or broaden your preferences."
              : "No jobs found for these filters."}
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm text-gray-500">
              {data.totalElements.toLocaleString()} job
              {data.totalElements === 1 ? "" : "s"}
              {tab === "matched" ? " matching your profile" : ""}
            </p>
            <div className="space-y-3">
              {data.content.map((job) => (
                <JobCard key={job.id} job={job} />
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
                <span className="text-sm text-gray-500">
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

export default function JobsPage() {
  return (
    <RequireAuth>
      <JobsContent />
    </RequireAuth>
  );
}
