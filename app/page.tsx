import type { Metadata } from "next";
import HomeClient from "./HomeClient";

// The landing renders static positioning numbers (per product), so no server
// fetch is needed. All interactivity lives in HomeClient.
export const metadata: Metadata = {
  description:
    "RoleOwl reads roles straight from company career pages — 80,000+ live tech roles right now — and emails you fresh matches every morning, before the big job boards have them.",
};

export default function Home() {
  return <HomeClient />;
}
