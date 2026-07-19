import type { Job } from "@/lib/types";

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

function ApplyLink({ url, compact = false }: { url: string; compact?: boolean }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`shrink-0 rounded-2xl border-2 border-b-4 border-amber-600 bg-amber-400 text-sm font-extrabold text-amber-950 transition-all hover:bg-amber-300 active:translate-y-[2px] active:border-b-2 ${
        compact ? "px-3 py-1" : "px-4 py-1.5"
      }`}
    >
      Apply
    </a>
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
}: {
  job: Job;
  mode?: JobCardMode;
}) {
  const seen = timeAgo(job.firstSeenAt);
  const isNew = seen === "today" || seen === "yesterday";

  if (mode === "list") {
    // Dense row: title · company · one key chip + Apply. Truncation is fine here;
    // the full detail lives in card mode.
    return (
      <div className="flex items-center gap-3 rounded-xl border-2 border-stone-200 bg-white px-3.5 py-2.5 transition-colors hover:border-amber-300">
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
        </div>
        {isNew && (
          <span className="hidden shrink-0 rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-teal-700 sm:inline">
            New
          </span>
        )}
        <span className="hidden shrink-0 sm:inline-flex">
          <Chip icon="pin">{job.location ?? "Location not listed"}</Chip>
        </span>
        <ApplyLink url={job.applicationUrl} compact />
      </div>
    );
  }

  return (
    <div className="shadow-hard-sm relative flex h-full flex-col rounded-2xl border-2 border-stone-800/90 bg-white p-4 transition-transform hover:-translate-y-0.5">
      {isNew && (
        <span className="absolute -top-2.5 right-4 rotate-2 rounded-lg border-2 border-stone-800/90 bg-teal-300 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-teal-950">
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
      </div>
      <div className="mt-4 flex flex-1 items-end justify-between gap-3">
        <p className="inline-flex items-center gap-1 text-xs font-semibold text-stone-400">
          {seen && (
            <>
              <ChipIcon kind="clock" />
              Spotted {seen}
            </>
          )}
        </p>
        <ApplyLink url={job.applicationUrl} />
      </div>
    </div>
  );
}
