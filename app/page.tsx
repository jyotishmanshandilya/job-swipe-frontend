"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const { authenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authenticated === true) router.replace("/jobs");
  }, [authenticated, router]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-4xl font-bold text-gray-900">
        Your next job, delivered daily.
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
        JobSwipe scans Greenhouse and other job boards for India-based roles,
        matches them to your profile, and emails you the best new openings
        every morning.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/register"
          className="rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          Get started — it&apos;s free
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
