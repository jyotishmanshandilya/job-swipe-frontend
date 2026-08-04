import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Company favicons for the landing "hiring now" strip (see lib/companies.ts).
    remotePatterns: [{ protocol: "https", hostname: "icons.duckduckgo.com" }],
  },
};

export default nextConfig;
