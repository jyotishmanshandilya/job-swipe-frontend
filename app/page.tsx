"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import OwlMascot from "@/components/OwlMascot";

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

const NIGHT_SHIFT = [
  {
    time: "11:12 PM",
    title: "Tell the owl once",
    body: "Pick the roles, cities, and experience level you care about. Two minutes before bed, changeable anytime.",
  },
  {
    time: "3:00 AM",
    title: "The sweep begins",
    body: "RoleOwl works through 300+ company job boards, pulling every new India opening it can find.",
  },
  {
    time: "8:00 AM",
    title: "Wake up to matches",
    body: "Roles that fit your profile are waiting in your inbox. No feeds to scroll, no spam.",
  },
];

const DIGEST_JOBS = [
  {
    title: "Senior Backend Engineer",
    meta: "Mosaic Pay · Bengaluru",
    tag: "4–6 yrs",
  },
  {
    title: "Frontend Engineer II",
    meta: "Juniper Health · Pune · hybrid",
    tag: "2–4 yrs",
  },
  {
    title: "Platform Engineer",
    meta: "Cartwheel · remote, India",
    tag: "new tonight",
  },
];

export default function Home() {
  const { authenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authenticated === true) router.replace("/jobs");
  }, [authenticated, router]);

  return (
    <div className="mx-auto max-w-5xl px-4">
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
              className="rise text-4xl font-black leading-tight tracking-tight text-[#FFF8ED] md:text-6xl"
              style={{ animationDelay: "0s" }}
            >
              The owl hunts{" "}
              <span className="text-[#FCD34D]">while you sleep.</span>
            </h1>
            <p
              className="rise mt-4 text-lg font-semibold text-[#CDC8EE]"
              style={{ animationDelay: "0.08s" }}
            >
              RoleOwl scans hundreds of company job boards overnight and
              delivers India tech roles matched to your profile — every
              morning, in one email.
            </p>
            <div
              className="rise mt-8 flex justify-center gap-3 md:justify-start"
              style={{ animationDelay: "0.16s" }}
            >
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
            </div>
            <p
              className="rise mt-6 text-sm font-bold text-[#A9A3D6]"
              style={{ animationDelay: "0.24s" }}
            >
              25,000+ live roles in the nest right now.
            </p>
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

      {/* the night shift, hour by hour */}
      <section className="py-16 md:py-20">
        <h2 className="text-center text-3xl font-black tracking-tight text-stone-800">
          The night shift
        </h2>
        <p className="mt-2 text-center text-sm font-semibold text-stone-500">
          What happens between good-night and good-morning.
        </p>
        <div className="relative mt-10">
          {/* flight path connecting the hours */}
          <div
            className="absolute left-0 right-0 top-[15px] hidden border-t-2 border-dashed border-amber-300 md:block"
            aria-hidden="true"
          />
          <div className="grid gap-8 md:grid-cols-3">
            {NIGHT_SHIFT.map((step) => (
              <div
                key={step.time}
                className="relative border-l-2 border-dashed border-amber-300 pl-5 md:border-l-0 md:pl-0"
              >
                <span className="relative z-10 inline-block rounded-full border-2 border-stone-300 bg-[#FFF8ED] px-3 py-1 font-mono text-xs font-bold tracking-wide text-stone-600">
                  {step.time}
                </span>
                <h3 className="mt-3 text-lg font-extrabold text-stone-800">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm font-semibold leading-relaxed text-stone-500">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* the deliverable itself: the 8 AM digest */}
      <section className="pb-16 md:pb-20">
        <h2 className="text-center text-3xl font-black tracking-tight text-stone-800">
          What 8 AM looks like
        </h2>
        <p className="mt-2 text-center text-sm font-semibold text-stone-500">
          One email. Only new roles, only your kind of roles.
        </p>
        <div className="mx-auto mt-10 max-w-lg -rotate-1 rounded-2xl border-2 border-b-8 border-stone-200 bg-white shadow-sm">
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
                <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">
                  {job.tag}
                </span>
              </li>
            ))}
          </ul>
          <div className="px-5 py-4 text-center">
            <Link
              href="/register"
              className="text-sm font-extrabold text-amber-700 underline decoration-2 underline-offset-4 hover:text-amber-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/40"
            >
              See all 7 matches
            </Link>
          </div>
        </div>
        <p className="mt-4 text-center text-xs font-bold text-stone-400">
          Sample digest. Yours will match your preferences.
        </p>
      </section>

      {/* bottom CTA */}
      <section className="mb-16 rounded-3xl border-2 border-stone-200 border-b-4 bg-white px-6 py-12 text-center">
        <div className="flex justify-center">
          <OwlMascot size={72} />
        </div>
        <h2 className="mt-4 text-2xl font-black text-stone-800">
          Stop scrolling job boards.
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-stone-500">
          Set your preferences once and let the owl do the night shift. Free,
          and you can unsubscribe with one click.
        </p>
        <Link
          href="/register"
          className="mt-6 inline-block rounded-2xl border-2 border-b-4 border-amber-600 bg-amber-400 px-6 py-3 text-base font-extrabold text-amber-950 transition-all hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/40 active:translate-y-[2px] active:border-b-2"
        >
          Create my account
        </Link>
      </section>

      <footer className="border-t-2 border-stone-200/70 py-8 text-center text-xs font-bold text-stone-400">
        RoleOwl · fresh India tech roles, every morning · roleowl.org
      </footer>
    </div>
  );
}
