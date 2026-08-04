import type { MetadataRoute } from "next";

const SITE = "https://www.roleowl.org";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // App pages behind auth carry no indexable content.
      disallow: ["/jobs", "/settings", "/onboarding", "/reset-password"],
    },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
