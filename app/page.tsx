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
  const boards = stats ? plusLabel(stats.totalBoards, 100) : "300+";
  const jobs = stats ? plusLabel(stats.totalJobs, 1000) : "25,000+";
  return {
    description: `RoleOwl reads ${boards} company hiring systems overnight — ${jobs} live India tech roles right now — and emails you fresh matches every morning.`,
  };
}

export default async function Home() {
  const stats = await fetchJobStats();
  return <HomeClient initialStats={stats} />;
}
