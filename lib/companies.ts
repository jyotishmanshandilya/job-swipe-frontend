/**
 * The stats endpoint surfaces the most-listed companies as lowercase slugs
 * (the stored `company_name`, e.g. "spacex", "purestorage", "tegnainc"). This
 * maps the ones we know to a proper display name + domain — the domain drives a
 * favicon logo. Unmapped slugs fall back to a title-cased name and a best-effort
 * "{slug}.com" logo, with a monogram if that 404s, so the strip degrades
 * gracefully as the corpus shifts over time.
 */

interface CompanyMeta {
  name: string;
  domain: string;
}

// Curated for the names we actually see topping the list, plus other common
// Greenhouse/Lever tech employers likely to surface. Keep display names as the
// brand writes them (SpaceX, NVIDIA, GitLab) — naive title-casing gets these
// wrong.
const COMPANY_MAP: Record<string, CompanyMeta> = {
  spacex: { name: "SpaceX", domain: "spacex.com" },
  databricks: { name: "Databricks", domain: "databricks.com" },
  coupang: { name: "Coupang", domain: "coupang.com" },
  stripe: { name: "Stripe", domain: "stripe.com" },
  waymo: { name: "Waymo", domain: "waymo.com" },
  okta: { name: "Okta", domain: "okta.com" },
  onemedical: { name: "One Medical", domain: "onemedical.com" },
  zscaler: { name: "Zscaler", domain: "zscaler.com" },
  purestorage: { name: "Pure Storage", domain: "purestorage.com" },
  tegnainc: { name: "TEGNA", domain: "tegna.com" },
  robinhood: { name: "Robinhood", domain: "robinhood.com" },
  reddit: { name: "Reddit", domain: "reddit.com" },
  discord: { name: "Discord", domain: "discord.com" },
  airbnb: { name: "Airbnb", domain: "airbnb.com" },
  doordash: { name: "DoorDash", domain: "doordash.com" },
  instacart: { name: "Instacart", domain: "instacart.com" },
  plaid: { name: "Plaid", domain: "plaid.com" },
  brex: { name: "Brex", domain: "brex.com" },
  ramp: { name: "Ramp", domain: "ramp.com" },
  notion: { name: "Notion", domain: "notion.so" },
  figma: { name: "Figma", domain: "figma.com" },
  anthropic: { name: "Anthropic", domain: "anthropic.com" },
  openai: { name: "OpenAI", domain: "openai.com" },
  scaleai: { name: "Scale AI", domain: "scale.com" },
  rippling: { name: "Rippling", domain: "rippling.com" },
  gusto: { name: "Gusto", domain: "gusto.com" },
  chime: { name: "Chime", domain: "chime.com" },
  affirm: { name: "Affirm", domain: "affirm.com" },
  coinbase: { name: "Coinbase", domain: "coinbase.com" },
  snowflake: { name: "Snowflake", domain: "snowflake.com" },
  datadog: { name: "Datadog", domain: "datadoghq.com" },
  cloudflare: { name: "Cloudflare", domain: "cloudflare.com" },
  gitlab: { name: "GitLab", domain: "gitlab.com" },
  hashicorp: { name: "HashiCorp", domain: "hashicorp.com" },
  twilio: { name: "Twilio", domain: "twilio.com" },
  samsara: { name: "Samsara", domain: "samsara.com" },
  nvidia: { name: "NVIDIA", domain: "nvidia.com" },
};

export interface CompanyDisplay {
  slug: string;
  name: string;
  /** Favicon URL, or null when we have no domain to look one up. */
  logoUrl: string | null;
}

function titleCase(slug: string): string {
  return slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Favicon for a domain — DuckDuckGo's service (free, no key, reliable). */
function faviconUrl(domain: string): string {
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}

export function companyDisplay(slug: string): CompanyDisplay {
  const key = slug.toLowerCase();
  const meta = COMPANY_MAP[key];
  // Guess a domain for unmapped single-token slugs; skip guessing when the slug
  // has spaces/punctuation (the guess would just 404 into the monogram anyway).
  const domain = meta?.domain ?? (/^[a-z0-9]+$/.test(key) ? `${key}.com` : null);
  return {
    slug,
    name: meta?.name ?? titleCase(slug),
    logoUrl: domain ? faviconUrl(domain) : null,
  };
}
