import type { Job } from "@/lib/types";

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
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-gray-900">
            {job.jobTitle}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {job.companyName && (
              <span className="font-medium text-gray-700 capitalize">
                {job.companyName}
              </span>
            )}
            {job.companyName && " · "}
            {job.location}
            {job.workplaceType && ` · ${job.workplaceType}`}
            {job.yearsOfExperience != null &&
              ` · ${job.yearsOfExperience}+ yrs`}
          </p>
          {seen && <p className="mt-1 text-xs text-gray-400">Added {seen}</p>}
        </div>
        <a
          href={job.applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Apply
        </a>
      </div>
    </div>
  );
}
