"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getJobStats } from "@/lib/api";
import { plusLabel } from "@/lib/stats";
import type { JobStats } from "@/lib/types";
import { useScrollReveal } from "@/lib/useScrollReveal";
import OwlMascot from "@/components/OwlMascot";
import JobTicker from "@/components/JobTicker";
import Sources from "@/components/Sources";
import CompanyStrip from "@/components/CompanyStrip";
import Faq from "@/components/Faq";
import { Squiggle } from "@/components/Doodles";

/** Rises into place the first time it scrolls into view. */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`${className} ${isVisible ? "rise" : "opacity-0"}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// `centerField` stars sit where the headline lives on small screens — desktop only.
const STARS: {
  top: string;
  left: string;
  size: number;
  delay: string;
  centerField?: boolean;
}[] = [
  { top: "14%", left: "5%", size: 3, delay: "0s" },
  { top: "8%", left: "22%", size: 2, delay: "0.9s", centerField: true },
  { top: "24%", left: "16%", size: 2, delay: "1.7s", centerField: true },
  { top: "10%", left: "44%", size: 3, delay: "0.4s", centerField: true },
  { top: "30%", left: "38%", size: 2, delay: "2.2s", centerField: true },
  { top: "7%", left: "62%", size: 2, delay: "1.2s", centerField: true },
  { top: "20%", left: "72%", size: 3, delay: "0.6s" },
  { top: "38%", left: "88%", size: 2, delay: "1.9s" },
  { top: "12%", left: "90%", size: 2, delay: "0.2s" },
  { top: "44%", left: "8%", size: 2, delay: "1.4s" },
  { top: "52%", left: "30%", size: 2, delay: "2.6s", centerField: true },
  { top: "46%", left: "58%", size: 2, delay: "0.8s", centerField: true },
];

const SPARKLES: { top: string; left: string; delay: string }[] = [
  { top: "16%", left: "32%", delay: "0.5s" },
  { top: "9%", left: "78%", delay: "1.6s" },
  { top: "40%", left: "46%", delay: "2.4s" },
];

const DIGEST_JOBS = [
  {
    title: "Senior Backend Engineer",
    meta: "Mosaic Pay · Bengaluru",
    tag: "4–6 yrs",
  },
  {
    title: "Frontend Engineer II",
    meta: "Juniper Health · London · hybrid",
    tag: "2–4 yrs",
  },
  {
    title: "Platform Engineer",
    meta: "Cartwheel · remote, worldwide",
    tag: "new tonight",
  },
];

export default function HomeClient({
  initialStats,
}: {
  initialStats: JobStats | null;
}) {
  const { authenticated } = useAuth();

  // Seeded with the server-rendered counts (so crawlers and first paint show
  // the real DB values), then refreshed client-side for live visitors.
  const [stats, setStats] = useState<JobStats | null>(initialStats);
  useEffect(() => {
    getJobStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  const jobsStat = stats ? plusLabel(stats.totalJobs, 1000) : "25,000+";
  const boardsStat = stats ? plusLabel(stats.totalBoards, 100) : "300+";

  return (
    <div className="grain mx-auto max-w-5xl px-4">
      {/* night-shift hero: the one dark moment on a cream page */}
      <section className="relative mt-6 overflow-hidden rounded-[2rem] border-2 border-b-8 border-[#211C3D] bg-gradient-to-b from-[#262143] to-[#3B3364] md:mt-10">
        {/* sky */}
        <div aria-hidden="true">
          {STARS.map((s, i) => (
            <span
              key={i}
              className={`twinkle absolute rounded-full bg-[#FCD34D] ${
                s.centerField ? "hidden md:block" : ""
              }`}
              style={{
                top: s.top,
                left: s.left,
                width: s.size,
                height: s.size,
                animationDelay: s.delay,
              }}
            />
          ))}
          {SPARKLES.map((s, i) => (
            <span
              key={i}
              className="twinkle absolute hidden text-xs text-[#FCD34D] md:inline"
              style={{ top: s.top, left: s.left, animationDelay: s.delay }}
            >
              ✦
            </span>
          ))}
          {/* crescent moon */}
          <svg
            className="absolute right-4 top-4 h-8 w-8 md:right-14 md:top-10 md:h-11 md:w-11"
            width="44"
            height="44"
            viewBox="0 0 44 44"
          >
            <circle cx="22" cy="22" r="18" fill="#FDE68A" />
            <circle cx="30" cy="16" r="16" fill="#2A2549" />
          </svg>
          {/* dawn rising at the panel's bottom edge */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-amber-400/25 to-transparent" />
        </div>

        <div className="relative flex flex-col items-center gap-8 px-6 pb-0 pt-16 md:flex-row md:items-end md:justify-between md:gap-12 md:px-14 md:pt-16">
          <div className="max-w-xl pb-10 text-center md:pb-16 md:text-left">
            <h1
              className="rise text-4xl font-extrabold leading-tight tracking-tight text-[#FFF8ED] md:text-6xl"
              style={{ animationDelay: "0s" }}
            >
              The owl hunts{" "}
              <span className="text-[#FCD34D]">while you sleep.</span>
            </h1>
            <p
              className="rise mt-4 text-lg font-semibold text-[#CDC8EE]"
              style={{ animationDelay: "0.08s" }}
            >
              RoleOwl reads company hiring systems directly — Greenhouse,
              Lever, and more — where roles appear first, often a full day
              before they reach the big job boards. You don&apos;t have that
              kind of time.
            </p>
            <div
              className="rise mt-8 flex justify-center gap-3 md:justify-start"
              style={{ animationDelay: "0.16s" }}
            >
              {authenticated ? (
                <Link
                  href="/jobs"
                  className="rounded-2xl border-2 border-b-4 border-amber-600 bg-amber-400 px-6 py-3 text-base font-extrabold text-amber-950 transition-all hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60 active:translate-y-[2px] active:border-b-2"
                >
                  Go to my jobs →
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="rounded-2xl border-2 border-b-4 border-amber-600 bg-amber-400 px-6 py-3 text-base font-extrabold text-amber-950 transition-all hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60 active:translate-y-[2px] active:border-b-2"
                  >
                    Start free
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-2xl border-2 border-b-4 border-[#4B4478] bg-[#3E3768] px-6 py-3 text-base font-extrabold text-[#EDEAFF] transition-all hover:bg-[#474071] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/40 active:translate-y-[2px] active:border-b-2"
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* the owl on watch, perched in the dawn glow */}
          <div className="flex shrink-0 flex-col items-center">
            <OwlMascot size={190} className="owl-bob -mb-1 drop-shadow-md" />
            <svg width="230" height="20" viewBox="0 0 230 20" aria-hidden="true">
              <rect x="0" y="4" width="230" height="10" rx="5" fill="#6B4423" />
              <rect x="130" y="10" width="80" height="6" rx="3" fill="#573618" />
            </svg>
          </div>
        </div>
      </section>

      {/* last night's haul, scrolling past */}
      <JobTicker />

      {/* provenance: the trust centerpiece */}
      <Reveal>
        <Sources jobsStat={jobsStat} boardsStat={boardsStat} />
      </Reveal>

      {/* recognizable companies currently hiring (from stats.topCompanies) */}
      {stats?.topCompanies && stats.topCompanies.length > 0 && (
        <Reveal>
          <CompanyStrip companies={stats.topCompanies} />
        </Reveal>
      )}

      {/* the deliverable itself: the morning digest */}
      <section className="pb-16 md:pb-20">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-stone-800">
          What lands in your inbox
        </h2>
        <p className="mt-2 text-center text-sm font-semibold text-stone-500">
          One email each morning. Only new roles, only your kind of roles.
        </p>
        <Reveal className="mx-auto mt-10 max-w-lg">
          <div className="shadow-hard -rotate-1 rounded-2xl border-2 border-stone-800/90 bg-white">
          <div className="flex items-center gap-3 border-b-2 border-stone-100 px-5 py-4">
            <OwlMascot size={36} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-stone-800">
                RoleOwl{" "}
                <span className="font-semibold text-stone-400">
                  digest@roleowl.org
                </span>
              </p>
              <p className="truncate text-sm font-bold text-stone-600">
                ☀️ 7 new matches for you
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-stone-400">
              8:02 AM
            </span>
          </div>
          <ul>
            {DIGEST_JOBS.map((job) => (
              <li
                key={job.title}
                className="flex items-center gap-3 border-b-2 border-stone-100 px-5 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-stone-800">
                    {job.title}
                  </p>
                  <p className="truncate text-xs font-semibold text-stone-500">
                    {job.meta}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                    job.tag === "new tonight"
                      ? "bg-grape-700 text-grape-50"
                      : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {job.tag}
                </span>
              </li>
            ))}
          </ul>
          <div className="px-5 py-4 text-center">
            <Link
              href={authenticated ? "/jobs" : "/register"}
              className="text-sm font-extrabold text-amber-700 underline decoration-2 underline-offset-4 hover:text-amber-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/40"
            >
              {authenticated ? "See my matches" : "See all 7 matches"}
            </Link>
          </div>
          </div>
        </Reveal>
        <p className="mt-4 text-center text-xs font-bold text-stone-400">
          Sample digest. Yours will match your preferences.
        </p>
      </section>

      {/* sensible questions, owl answers */}
      <Faq />

      {/* bottom CTA */}
      <section className="shadow-hard mb-16 rounded-3xl border-2 border-stone-800/90 bg-white px-6 py-12 text-center">
        <div className="flex justify-center">
          <OwlMascot size={72} />
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-stone-800">
          See it before the crowd does.
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-stone-500">
          RoleOwl reads company career systems directly — where roles appear
          first. Set your preferences once and you&apos;ll be reading new roles
          a full day before the queue on the big boards even forms.
        </p>
        <Link
          href={authenticated ? "/jobs" : "/register"}
          className="mt-6 inline-block rounded-2xl border-2 border-b-4 border-amber-600 bg-amber-400 px-6 py-3 text-base font-extrabold text-amber-950 transition-all hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/40 active:translate-y-[2px] active:border-b-2"
        >
          {authenticated ? "Go to my jobs →" : "Create my account"}
        </Link>
      </section>

      <footer className="border-t-2 border-stone-200/70 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <OwlMascot size={26} />
              <span className="font-display text-lg font-extrabold text-stone-800">
                Role<span className="text-amber-600">Owl</span>
              </span>
            </div>
            <p className="mt-2 max-w-[26ch] text-xs font-semibold leading-relaxed text-stone-500">
              Fresh tech roles read straight from company hiring systems,
              delivered every morning.
            </p>
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-stone-400">
              Product
            </p>
            <ul className="mt-2 space-y-1.5 text-sm font-bold text-stone-600">
              <li>
                <Link href="/register" className="hover:text-amber-700">
                  Create an account
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-700">
                  Log in
                </Link>
              </li>
              <li>
                <a href="#faq" className="hover:text-amber-700">
                  Questions &amp; answers
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-stone-400">
              Your data
            </p>
            <ul className="mt-2 space-y-1.5 text-xs font-semibold leading-relaxed text-stone-500">
              <li>Free — no card, no trial clock.</li>
              <li>We store your email and preferences, nothing else.</li>
              <li>Delete your account anytime in Settings — everything goes with it.</li>
              <li>Unsubscribe from the digest in one click, right in the email.</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex items-center justify-between border-t-2 border-dashed border-stone-200 pt-5 text-xs font-bold text-stone-400">
          <span>© 2026 RoleOwl · roleowl.org</span>
          <span className="text-amber-400">
            <Squiggle size={36} />
          </span>
        </div>
      </footer>
    </div>
  );
}
