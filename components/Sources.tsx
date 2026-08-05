/**
 * Provenance section: the trust centerpiece of the landing page. Not a
 * "trusted by" logo strip — these are the hiring systems RoleOwl actually
 * reads, shown with the real domains users will recognize in apply URLs.
 * Live counts arrive from /api/jobs/stats via the page.
 */

import Image from "next/image";

const SOURCES = [
  {
    name: "Greenhouse",
    domain: "boards.greenhouse.io",
    tilt: "-rotate-2",
    logo: "/logos/greenhouse.png",
  },
  {
    name: "Lever",
    domain: "jobs.lever.co",
    tilt: "rotate-1",
    logo: "/logos/lever.png",
  },
  {
    name: "Recruitee",
    domain: "recruitee.com",
    tilt: "-rotate-1",
    logo: "/logos/recruitee.png",
  },
  {
    name: "Personio",
    domain: "jobs.personio.de",
    tilt: "rotate-2",
    logo: "/logos/personio.png",
  },
];

function Tick() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mt-0.5 shrink-0 text-teal-600"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function Sources({
  jobsStat,
  boardsStat,
}: {
  jobsStat: string;
  boardsStat: string;
}) {
  return (
    <section className="py-14 md:py-16">
      <p className="text-center text-xs font-bold uppercase tracking-widest text-stone-400">
        Where the jobs come from
      </p>
      <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-stone-800">
        Straight from the source
      </h2>
      <p className="mx-auto mt-2 max-w-md text-center text-sm font-semibold text-stone-500">
        RoleOwl reads the hiring platforms companies run their careers pages
        on — the systems recruiters post to first.
      </p>

      <div className="mt-8 grid grid-cols-2 justify-items-center gap-4 sm:flex sm:flex-wrap sm:justify-center md:gap-5">
        {SOURCES.map((s) => (
          <div
            key={s.name}
            className={`shadow-hard-sm wiggle-hover w-full max-w-[180px] rounded-xl border-2 border-stone-800/90 bg-white p-3 ${s.tilt}`}
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-stone-200 bg-white">
                <Image
                  src={s.logo}
                  alt={`${s.name} logo`}
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-stone-800">
                  {s.name}
                </p>
                <p className="truncate font-mono text-[10px] font-bold text-stone-400">
                  {s.domain}
                </p>
              </div>
            </div>
            <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-teal-700">
              read directly
            </p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-8 flex max-w-xl flex-col items-start gap-2.5 sm:items-center">
        <p className="flex items-start gap-2 text-sm font-semibold text-stone-600">
          <Tick />
          Every apply link opens the company&apos;s own careers site — no
          reposts, no recruiters, no middlemen.
        </p>
        <p className="flex items-start gap-2 text-sm font-semibold text-stone-600">
          <Tick />
          <span>
            <span className="font-extrabold text-stone-800">{boardsStat}</span>{" "}
            company boards checked nightly ·{" "}
            <span className="font-extrabold text-stone-800">{jobsStat}</span>{" "}
            live roles right now
          </span>
        </p>
      </div>
    </section>
  );
}
