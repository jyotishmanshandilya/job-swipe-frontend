"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import OwlMascot from "@/components/OwlMascot";

const STATS = [
  { value: "25,000+", label: "live jobs in the nest" },
  { value: "300+", label: "companies watched" },
  { value: "8 AM", label: "fresh matches, daily" },
];

const STEPS = [
  {
    title: "Tell the owl once",
    body: "Pick the roles, cities, and experience level you care about. Two minutes, changeable anytime.",
  },
  {
    title: "It hunts overnight",
    body: "Every night, RoleOwl sweeps 300+ company job boards for new India openings — while you sleep.",
  },
  {
    title: "Wake up to matches",
    body: "Fresh roles that fit your profile land in your inbox at 8 AM. No feeds to scroll, no spam.",
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
      {/* hero */}
      <section className="flex flex-col-reverse items-center gap-10 py-16 md:flex-row md:gap-16 md:py-24">
        <div className="max-w-xl text-center md:text-left">
          <h1 className="text-4xl font-black leading-tight text-stone-800 md:text-5xl">
            The owl hunts <span className="text-amber-600">while you sleep.</span>
          </h1>
          <p className="mt-4 text-lg font-semibold text-stone-600">
            RoleOwl scans hundreds of company job boards overnight and delivers
            India tech roles matched to your profile — every morning, in one
            email.
          </p>
          <div className="mt-8 flex justify-center gap-3 md:justify-start">
            <Link
              href="/register"
              className="rounded-2xl border-2 border-b-4 border-amber-600 bg-amber-400 px-6 py-3 text-base font-extrabold text-amber-950 transition-all hover:bg-amber-300 active:translate-y-[2px] active:border-b-2"
            >
              Start free
            </Link>
            <Link
              href="/login"
              className="rounded-2xl border-2 border-b-4 border-stone-300 bg-white px-6 py-3 text-base font-extrabold text-stone-700 transition-all hover:bg-stone-50 active:translate-y-[2px] active:border-b-2"
            >
              Log in
            </Link>
          </div>
        </div>
        <OwlMascot size={220} className="shrink-0 drop-shadow-sm" />
      </section>

      {/* stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border-2 border-stone-200 border-b-4 bg-white p-6 text-center"
          >
            <p className="text-3xl font-black text-amber-600">{s.value}</p>
            <p className="mt-1 text-sm font-bold text-stone-500">{s.label}</p>
          </div>
        ))}
      </section>

      {/* how it works */}
      <section className="py-16 md:py-20">
        <h2 className="text-center text-3xl font-black text-stone-800">
          How it works
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="rounded-2xl border-2 border-stone-200 border-b-4 bg-white p-6"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-base font-black text-amber-950">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-extrabold text-stone-800">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm font-semibold leading-relaxed text-stone-500">
                {step.body}
              </p>
            </div>
          ))}
        </div>
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
          className="mt-6 inline-block rounded-2xl border-2 border-b-4 border-amber-600 bg-amber-400 px-6 py-3 text-base font-extrabold text-amber-950 transition-all hover:bg-amber-300 active:translate-y-[2px] active:border-b-2"
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
