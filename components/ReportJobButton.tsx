"use client";

import { useState } from "react";
import { Alert, Button, Modal } from "./ds";
import { ApiRequestError, reportJob } from "@/lib/api";
import type { Job, ReportReason } from "@/lib/types";

export const REASONS: { value: ReportReason; label: string }[] = [
  { value: "EXPIRED", label: "Job is no longer open" },
  { value: "WRONG_LOCATION", label: "Wrong location" },
  { value: "WRONG_EXPERIENCE", label: "Wrong experience level" },
  { value: "MISSING_EXPERIENCE", label: "Missing experience requirement" },
  { value: "SPAM", label: "Spam / not a real job" },
  { value: "OTHER", label: "Something else" },
];

/**
 * Small "report" affordance for the matched feed. Reporting removes the job
 * from this user's feed server-side; `onReported` lets the list drop the card
 * without a refetch.
 */
export default function ReportJobButton({
  job,
  onReported,
}: {
  job: Job;
  onReported: (jobId: string) => void;
}) {
  // "form" = pick a reason, "confirm" = final are-you-sure step.
  const [step, setStep] = useState<"closed" | "form" | "confirm">("closed");
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const close = () => {
    setStep("closed");
    setReason(null);
    setDetails("");
    setError(null);
  };

  const submit = async () => {
    if (!reason) return;
    setError(null);
    setBusy(true);
    try {
      await reportJob(job.id, {
        reason,
        details: details.trim() ? details.trim() : undefined,
      });
      close();
      onReported(job.id);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Failed to report job",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setStep("form")}
        title="Report this job"
        className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-stone-400 transition-colors hover:text-rose-600"
      >
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
        >
          <path d="M4 21V4" />
          <path d="M4 4h13l-2 4 2 4H4" />
        </svg>
        Report
      </button>

      <Modal open={step === "form"} onClose={close} title="Report this job">
        <p className="text-sm font-semibold text-stone-500">
          <span className="font-extrabold text-stone-700">{job.jobTitle}</span>
          {job.companyName && ` · ${job.companyName}`}
        </p>
        <p className="mt-1 text-xs font-semibold text-stone-400">
          It&apos;ll disappear from your feed and help the owl hunt better.
        </p>

        {error && (
          <div className="mt-3">
            <Alert kind="error">{error}</Alert>
          </div>
        )}

        <div className="mt-4 space-y-2">
          {REASONS.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setReason(r.value)}
              className={`block w-full cursor-pointer rounded-xl border-2 px-3 py-2 text-left text-sm font-bold transition-colors ${
                reason === r.value
                  ? "border-amber-500 bg-amber-100 text-amber-950"
                  : "border-stone-200 bg-white text-stone-600 hover:border-amber-300"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {reason && (
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder={
              reason === "OTHER"
                ? "Tell us what's wrong…"
                : "Anything else? (optional)"
            }
            className="mt-3 w-full rounded-2xl border-2 border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
        )}

        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={!reason}
            onClick={() => setStep("confirm")}
          >
            Report job
          </Button>
        </div>
      </Modal>

      <Modal open={step === "confirm"} onClose={close} title="Report this job?">
        <p className="text-sm font-semibold text-stone-500">
          <span className="font-extrabold text-stone-700">{job.jobTitle}</span>
          {job.companyName && ` · ${job.companyName}`} will be reported as{" "}
          <span className="font-extrabold text-stone-700">
            {REASONS.find((r) => r.value === reason)?.label.toLowerCase()}
          </span>{" "}
          and removed from your feed. You can undo right after.
        </p>

        {error && (
          <div className="mt-3">
            <Alert kind="error">{error}</Alert>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setStep("form")}
          >
            Back
          </Button>
          <Button type="button" variant="danger" disabled={busy} onClick={submit}>
            {busy ? "Reporting…" : "Yes, report it"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
