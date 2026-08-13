import type { Metadata } from "next";
import { fetchJobStats, plusLabel } from "@/lib/stats";
import HomeClient from "./HomeClient";

/**
 * Home is a server component purely so the landing stats are rendered on the
 * server: Googlebot (and the meta description) then reflect the real DB counts
 * instead of the client-side fallback strings. All interactivity lives in
 * HomeClient.
 */
export async function generateMetadata(): Promise<Metadata> {
  const stats = await fetchJobStats();
  const jobs = stats ? plusLabel(stats.totalJobs, 1000) : "25,000+";
  return {
    description: `RoleOwl reads roles straight from company career pages — ${jobs} live tech roles right now — and emails you fresh matches every morning, before the big job boards have them.`,
  };
}

export default async function Home() {
  const stats = await fetchJobStats();
  return <HomeClient initialStats={stats} />;
}
