import type { MetadataRoute } from "next";

const SITE = "https://www.roleowl.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/forgot-password`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
