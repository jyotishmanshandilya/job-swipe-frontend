import type { Job } from "@/lib/types";

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

export default function JobCard({ job }: { job: Job }) {
  const seen = timeAgo(job.firstSeenAt);
  const isNew = seen === "today" || seen === "yesterday";
  return (
    <div className="rounded-2xl border-2 border-stone-200 border-b-4 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-amber-300">
      <div className="flex items-start gap-3.5">
        {/* company avatar */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-lg font-extrabold uppercase text-amber-800">
          {(job.companyName ?? job.jobTitle).charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-extrabold text-stone-800">
              {job.jobTitle}
            </h3>
            {isNew && (
              <span className="shrink-0 rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-teal-700">
                New
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-sm text-stone-500">
            {job.companyName && (
              <span className="font-bold capitalize text-stone-700">
                {job.companyName}
              </span>
            )}
            {job.companyName && " · "}
            {job.location ?? "Location not listed"}
            {job.workplaceType && ` · ${job.workplaceType}`}
            {` · ${yoeLabel(job)}`}
          </p>
          {seen && (
            <p className="mt-0.5 text-xs font-semibold text-stone-400">
              Spotted {seen}
            </p>
          )}
        </div>
        <a
          href={job.applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 self-center rounded-2xl border-2 border-b-4 border-amber-600 bg-amber-400 px-4 py-1.5 text-sm font-extrabold text-amber-950 transition-all hover:bg-amber-300 active:translate-y-[2px] active:border-b-2"
        >
          Apply
        </a>
      </div>
    </div>
  );
}
