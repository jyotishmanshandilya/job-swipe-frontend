"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getJobStats } from "@/lib/api";
import { plusLabel } from "@/lib/stats";
import type { JobStats } from "@/lib/types";
import { Button, OwlMascot } from "@/components/ds";

/*
 * RoleOwl marketing landing — rebuilt on the exported Claude Design system
 * (design-system/claude-design-system, "marketing-website" template). Tokens
 * come from app/ds/tokens.css under the `.rds` scope; real DB stats + auth-aware
 * CTAs are wired into the template's placeholders.
 */

const FEATURES = [
  {
    title: "Reads the source, not the boards",
    body: "RoleOwl reads roles straight from company hiring systems — direct from each company's own careers page.",
    path: <><path d="M4 14a4 4 0 0 1 0-8" /><path d="M8 17a7 7 0 0 1 0-14" /><circle cx="12" cy="10" r="2.2" /></>,
  },
  {
    title: "Built for your filters",
    body: "Set your roles and locations once. Only matching openings ever reach your inbox.",
    path: <path d="M4 5h16l-6 8v6l-4 2v-8z" />,
  },
  {
    title: "First, not eventually",
    body: "See roles before they're reindexed onto the big job boards.",
    path: <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l3 2" /><path d="M9 2h6" /></>,
  },
];

const STEPS = [
  { n: "1", t: "Sign up", d: "Create a free account in under a minute. No resume needed." },
  { n: "2", t: "Set filters", d: "Tell the owl which roles, levels, and locations you want." },
  { n: "3", t: "Owl scans the source", d: "It reads company hiring systems directly, not job boards." },
  { n: "4", t: "Apply first", d: "Matching roles land in your digest while they are still fresh." },
];

const PRIVACY = [
  {
    t: "No resume required",
    d: "RoleOwl only needs your role and location preferences to match you with listings. Nothing else is required to get started.",
    // document
    path: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h3" /></>,
  },
  {
    t: "Never sold or shared",
    d: "Your preferences and email are used to send your digest. They are never sold or shared with third parties.",
    // lock
    path: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  },
  {
    t: "Read-only access",
    d: "RoleOwl reads public career page listings. It never logs into a company's systems or accesses private data.",
    // eye
    path: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>,
  },
];

/**
 * The 12 job fields RoleOwl surfaces roles across (scale section chips), ranked
 * by ACTIVE-job volume in prod. Source: FEATURED_COMPANIES_AND_FIELDS.md
 * (2026-08-13 snapshot). Static — can be made dynamic (see BACKEND_HANDOVER.md).
 */
const FIELDS = [
  "Engineering", "Sales", "Operations & PM", "Marketing", "Data & AI/ML",
  "Finance & Accounting", "Product", "Design", "Customer Support / Success",
  "People / HR", "Legal & Compliance", "Security & IT",
];

/**
 * Curated recognizable companies whose roles are tracked (trust grid). Logos are
 * vendored in public/logos/<slug>.png. Source: FEATURED_COMPANIES_AND_FIELDS.md.
 */
const FEATURED = [
  { name: "SpaceX", slug: "spacex" },
  { name: "Databricks", slug: "databricks" },
  { name: "OpenAI", slug: "openai" },
  { name: "Stripe", slug: "stripe" },
  { name: "Cloudflare", slug: "cloudflare" },
  { name: "Palantir", slug: "palantir" },
  { name: "Paytm", slug: "paytm" },
  { name: "Coupang", slug: "coupang" },
  { name: "Waymo", slug: "waymo" },
  { name: "HelloFresh", slug: "hellofresh" },
  { name: "Toast", slug: "toast" },
  { name: "Pinterest", slug: "pinterest" },
];

/**
 * Additional recognizable companies shown as a small-text "…and many more"
 * strip under the logo wall. Illustrative curation of brands that hire on the
 * career platforms RoleOwl reads — trim/extend as the tracked set is verified.
 */
const MORE_COMPANIES = [
  "Reddit", "Discord", "Notion", "Figma", "Airbnb", "DoorDash", "Instacart",
  "Robinhood", "Coinbase", "Twilio", "Snowflake", "Datadog", "Plaid", "Ramp",
  "Brex", "Gusto", "Rippling", "Vercel", "Retool", "Airtable", "Asana",
  "Dropbox", "Affirm", "Chime", "Grammarly", "Miro", "Canva", "Zapier",
  "GitLab", "HashiCorp", "MongoDB", "Elastic", "Nubank", "Klarna", "Wise",
  "Deel", "Cohere", "Scale AI", "Verkada", "Samsara",
];

/**
 * Sample roles for the landing marquee. Static by design — a curated list is
 * provided by product (no backend). Sources (ATS names) are intentionally
 * omitted; we surface role + company + city only.
 */
const MARQUEE = [
  { role: "Senior Frontend Engineer", company: "Series B startup", loc: "Remote" },
  { role: "Staff Product Designer", company: "Growth-stage co.", loc: "Berlin" },
  { role: "HR Ops Lead", company: "European scale-up", loc: "Amsterdam" },
  { role: "Backend Engineer, Platform", company: "Infra company", loc: "Remote" },
  { role: "Engineering Manager", company: "Devtools startup", loc: "London" },
  { role: "Product Manager", company: "Marketplace co.", loc: "Bengaluru" },
  { role: "Data Scientist", company: "Fintech scale-up", loc: "Remote" },
  { role: "DevOps Engineer", company: "Cloud company", loc: "Dublin" },
];

const FAQS = [
  { q: "How does RoleOwl find new roles?", a: "It reads listings straight from companies' own careers pages and refreshes them continuously — so a role usually shows up here about as soon as it goes live." },
  { q: "Why do roles show up here before the big job boards?", a: "Big boards reindex company feeds on their own schedule, often well after a role goes live. RoleOwl checks the source directly, so you see it sooner." },
  { q: "How does matching work?", a: "You tell the owl the roles, levels, and locations you want. Only openings that fit reach your daily digest — no unrelated noise." },
  { q: "How fresh are the listings?", a: "Continuously refreshed. When a role closes it drops off, and new ones surface as they appear, so what you see reflects what's actually open." },
  { q: "Is RoleOwl free?", a: "Yes — no card, no trial clock. Set your preferences and the owl starts hunting right away." },
  { q: "What if the owl finds nothing?", a: "Some stretches are quiet. We'll say so plainly instead of padding your inbox with roles that don't fit your filters." },
];

const overline: React.CSSProperties = { margin: "0 0 6px", fontSize: 13, fontWeight: 800, letterSpacing: "var(--tracking-widest)", textTransform: "uppercase", color: "var(--text-faint)" };
const h2Style: React.CSSProperties = { margin: "0 0 24px", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 32, letterSpacing: "var(--tracking-tight)" };
const card: React.CSSProperties = { borderRadius: "var(--radius-2xl)", border: "1px solid var(--border-default)", background: "var(--surface-card)", boxShadow: "var(--shadow-soft-xs)" };
const section: React.CSSProperties = { maxWidth: 1080, margin: "96px auto 0", padding: "0 24px" };

function FeatureIcon({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "50%", background: "var(--grape-100)", color: "var(--grape-700)", marginBottom: 14 }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
    </div>
  );
}

export default function HomeClient({ initialStats }: { initialStats: JobStats | null }) {
  const { authenticated } = useAuth();
  const [stats, setStats] = useState<JobStats | null>(initialStats);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    getJobStats().then(setStats).catch(() => {});
  }, []);

  const jobsStat = stats ? plusLabel(stats.totalJobs, 1000) : "25,000+";
  // Static positioning number (per product): the size of the tracked universe,
  // not the DB row count.
  const companiesStat = "80,000+";

  const primaryHref = authenticated ? "/jobs" : "/register";
  const primaryLabel = authenticated ? "Go to my jobs" : "Start free";
  const marqueeDoubled = [...MARQUEE, ...MARQUEE];

  return (
    <div className="rds" style={{ position: "relative", minHeight: "100vh" }}>
      {/* ambient background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", backgroundImage: "radial-gradient(rgb(109 78 189 / .16) 1px,transparent 1.5px)", backgroundSize: "30px 30px" }} />
      <div style={{ position: "fixed", top: -160, left: -120, zIndex: 0, pointerEvents: "none", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle,rgb(109 78 189 / .1),transparent 70%)" }} />
      <div style={{ position: "fixed", bottom: -200, right: -140, zIndex: 0, pointerEvents: "none", width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle,rgb(253 230 138 / .16),transparent 70%)" }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* floating glass nav */}
        <nav style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", zIndex: 20, width: "calc(100% - 32px)", maxWidth: 920, display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "var(--radius-full)", border: "1px solid var(--glass-border)", background: "var(--glass-bg)", backdropFilter: "blur(var(--blur-md))", boxShadow: "var(--shadow-soft-sm)", padding: "10px 12px 10px 20px" }}>
          <Link href="/" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, display: "flex", alignItems: "center", gap: 8, color: "var(--text-primary)", textDecoration: "none" }}>
            <OwlMascot size={24} />RoleOwl
          </Link>
          <div className="r-nav-links" style={{ display: "flex", alignItems: "center", gap: 34, fontSize: 14, fontWeight: 700, color: "var(--stone-600)" }}>
            <a href="#about" style={{ cursor: "pointer", color: "inherit", textDecoration: "none" }}>About</a>
            <a href="#stats" style={{ cursor: "pointer", color: "inherit", textDecoration: "none" }}>Stats</a>
            <a href="#faq" style={{ cursor: "pointer", color: "inherit", textDecoration: "none" }}>FAQ</a>
          </div>
          <Link href={primaryHref} style={{ textDecoration: "none" }}><Button size="sm">{primaryLabel}</Button></Link>
        </nav>

        {/* sticky-stacking hero sequence */}
        <div style={{ position: "relative" }}>
          {/* 1 — night hero */}
          <section className="r-stack" style={{ position: "sticky", top: 0, zIndex: 1, height: "100vh", padding: "104px 24px 24px", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="r-hero-inner r-hero-grid" style={{ position: "relative", width: "100%", maxWidth: 1080, height: "70vh", overflow: "hidden", borderRadius: 20, background: "linear-gradient(150deg,var(--night-bg-start),var(--night-bg-end))", display: "grid", gridTemplateColumns: "1.2fr 0.8fr", alignItems: "center", padding: "0 84px" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgb(255 255 255 / .5) 1px,transparent 1.5px)", backgroundSize: "26px 26px", opacity: 0.18 }} />
              <span style={{ position: "absolute", left: "6%", top: "16%", color: "var(--night-star)", animation: "rtwinkle 3s ease-in-out infinite" }}>✦</span>
              <span style={{ position: "absolute", left: "34%", top: "10%", color: "var(--amber-200)", fontSize: 9, animation: "rtwinkle 3s ease-in-out infinite .7s" }}>✦</span>
              <span style={{ position: "absolute", right: "8%", top: "14%", color: "var(--night-star)", fontSize: 10, animation: "rtwinkle 3s ease-in-out infinite .4s" }}>✦</span>
              <div style={{ position: "relative", textAlign: "left" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, margin: "0 0 14px", borderRadius: "var(--radius-full)", border: "1px solid var(--glass-border)", background: "rgb(255 255 255 / .1)", backdropFilter: "blur(var(--blur-md))", padding: "6px 14px 6px 8px", animation: "rfadeup .7s var(--ease-standard) both" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--emerald-300)", boxShadow: "0 0 8px var(--emerald-300)" }} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: "var(--night-text)" }}>{jobsStat} live roles right now</span>
                </div>
                <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(32px,3.6vw,52px)", lineHeight: 1.05, letterSpacing: "var(--tracking-tight)", color: "var(--night-text)", animation: "rfadeup .7s var(--ease-standard) .08s both" }}>
                  Find jobs before<br /><span style={{ color: "var(--night-star)" }}>the crowd does.</span>
                </h1>
                <p style={{ margin: "18px 0 0", fontSize: 17, fontWeight: 600, color: "var(--night-lilac)", maxWidth: 420, animation: "rfadeup .7s var(--ease-standard) .16s both" }}>
                  RoleOwl reads company hiring systems directly, so new roles reach you before the job boards catch up.
                </p>
                <div style={{ display: "flex", gap: 14, marginTop: 24, alignItems: "center", animation: "rfadeup .7s var(--ease-standard) .24s both" }}>
                  <Link href={primaryHref} style={{ textDecoration: "none" }}><Button size="lg">{primaryLabel}</Button></Link>
                  <Link href={authenticated ? "/jobs" : "/login"} style={{ fontSize: 13, fontWeight: 800, color: "var(--night-lilac)", cursor: "pointer", borderBottom: "2px solid var(--night-btn-border)", paddingBottom: 2, textDecoration: "none" }}>
                    {authenticated ? "My jobs" : "Log in"} →
                  </Link>
                </div>
              </div>
              <div className="r-hero-cards" style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ position: "relative", width: 360, height: 340 }}>
                  <div style={{ position: "absolute", left: 0, top: 0, width: 300, transform: "skewY(-8deg) translate(20px,170px)", filter: "grayscale(100%)", opacity: 0.45, borderRadius: "var(--radius-2xl)", background: "var(--grape-800)", border: "1px solid rgb(255 255 255 / .12)", padding: "18px 22px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: "50%", background: "var(--emerald-100)", color: "var(--emerald-700)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>B</span>
                      <div><p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>Backend Engineer</p><p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--night-lilac)" }}>Infra company</p></div>
                    </div>
                  </div>
                  <div style={{ position: "absolute", left: 0, top: 0, width: 300, transform: "skewY(-8deg) translate(10px,98px)", filter: "grayscale(100%)", opacity: 0.7, borderRadius: "var(--radius-2xl)", background: "var(--grape-700)", border: "1px solid rgb(255 255 255 / .14)", padding: "18px 22px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: "50%", background: "var(--grape-100)", color: "var(--grape-700)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>P</span>
                      <div><p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>Product Designer</p><p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--night-lilac)" }}>Growth-stage co.</p></div>
                    </div>
                  </div>
                  <div style={{ position: "absolute", left: 0, top: 0, width: 320, transform: "skewY(-8deg) translate(0,20px)", borderRadius: "var(--radius-2xl)", background: "var(--surface-card)", border: "1px solid var(--border-default)", boxShadow: "var(--shadow-soft-lg)", padding: "22px 26px" }}>
                    <span style={{ position: "absolute", top: 12, right: 18, borderRadius: "var(--radius-full)", background: "var(--emerald-700)", color: "#fff", fontSize: 12, fontWeight: 800, padding: "3px 12px", boxShadow: "var(--shadow-soft-sm)" }}>New match</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: "50%", background: "var(--amber-200)", color: "var(--amber-950)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17 }}>S</span>
                      <div><p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2 }}>Senior Frontend Engineer</p><p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--text-faint)" }}>Series B startup · Remote</p></div>
                    </div>
                  </div>
                  <div style={{ position: "absolute", right: -16, bottom: -8, display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2 }}>
                    <OwlMascot variant="happy" size={130} style={{ filter: "drop-shadow(0 16px 24px rgb(0 0 0 / .45))", animation: "rbob 4.5s ease-in-out infinite" }} />
                    <div style={{ marginTop: -6, borderRadius: "var(--radius-full)", background: "var(--night-text)", padding: "4px 11px", fontSize: 12, fontWeight: 800, color: "var(--grape-800)", boxShadow: "var(--shadow-soft-sm)", transform: "rotate(-4deg)", whiteSpace: "nowrap" }}>on the hunt</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2 — trust grid */}
          <section id="sources" className="r-stack" style={{ position: "sticky", top: 0, zIndex: 2, height: "100vh", padding: "104px 24px 24px", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="r-stack-inner" style={{ width: "100%", maxWidth: 1080, minHeight: "70vh", borderRadius: 20, background: "var(--surface-card)", boxShadow: "var(--shadow-soft-lg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 84px", boxSizing: "border-box" }}>
              <div style={{ maxWidth: 960, width: "100%", textAlign: "center" }}>
                <p style={overline}>Their open roles, tracked here</p>
                <h2 style={{ ...h2Style, fontSize: 36, marginBottom: 28 }}>Jobs from companies like these are listed on RoleOwl</h2>
                <div className="r-logos" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                  {FEATURED.map((c) => (
                    <div key={c.slug} style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 128, boxSizing: "border-box", padding: "24px 28px", background: "#fff", border: "1px solid var(--border-default)", borderRadius: "var(--radius-2xl)", boxShadow: "var(--shadow-soft-xs)" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/logos/${c.slug}.png`} alt={c.name} style={{ maxWidth: "50%", maxHeight: 38, objectFit: "contain" }} />
                    </div>
                  ))}
                </div>
                <p style={{ margin: "20px auto 0", maxWidth: 840, fontSize: 12.5, fontWeight: 600, lineHeight: 1.9, color: "var(--text-faint)" }}>
                  <span style={{ fontWeight: 800, color: "var(--text-muted)" }}>…and thousands more, including </span>
                  {MORE_COMPANIES.join(" · ")}
                </p>
              </div>
            </div>
          </section>

          {/* 3 — scale stats */}
          <section id="stats" className="r-stack" style={{ position: "sticky", top: 0, zIndex: 3, height: "100vh", padding: "104px 24px 24px", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="r-stack-inner" style={{ width: "100%", maxWidth: 1080, minHeight: "70vh", borderRadius: 20, background: "var(--surface-card)", boxShadow: "var(--shadow-soft-lg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 84px", boxSizing: "border-box" }}>
              <div style={{ maxWidth: 980, width: "100%" }}>
                <p style={{ ...overline, textAlign: "center" }}>The scale of the hunt</p>
                <h2 style={{ ...h2Style, fontSize: 36, textAlign: "center", marginBottom: 28 }}>Tracked directly from the source</h2>

                {/* 2×6 grid: jobs (r1 c1–2), companies (r1 c3–4), owl (r1–2 c5–6),
                    departments (r2 c1–4). Collapses to a stack on mobile. */}
                <div className="r-scale-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 20, alignItems: "start" }}>
                  {([["1 / 3", jobsStat, "jobs surfaced"], ["3 / 5", companiesStat, "companies tracked"]] as const).map(([col, big, small]) => (
                    <div key={small} style={{ gridColumn: col, gridRow: 1, ...card, padding: "22px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                      <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, letterSpacing: "var(--tracking-tight)", background: "linear-gradient(135deg,var(--grape-700),var(--grape-500))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{big}</p>
                      <p style={{ margin: "6px 0 0", fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>{small}</p>
                    </div>
                  ))}

                  {/* owl — no card background, spans + centers across both rows */}
                  <div style={{ gridColumn: "5 / 7", gridRow: "1 / 3", alignSelf: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                    <OwlMascot variant="happy" size={104} style={{ animation: "rbob 4.5s ease-in-out infinite" }} />
                    <span style={{ borderRadius: "var(--radius-full)", background: "var(--grape-600)", padding: "4px 14px", fontSize: 12, fontWeight: 800, color: "#fff", whiteSpace: "nowrap", transform: "rotate(-3deg)" }}>hunting 24/7</span>
                  </div>

                  {/* fields — row 2, cols 1–4 */}
                  <div style={{ gridColumn: "1 / 5", gridRow: 2, ...card, padding: "22px 24px" }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 800, letterSpacing: "var(--tracking-widest)", textTransform: "uppercase", color: "var(--grape-600)" }}>{FIELDS.length} fields covered</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                      {FIELDS.map((f) => (
                        <span key={f} style={{ borderRadius: "var(--radius-full)", background: "var(--grape-100)", color: "var(--grape-700)", padding: "5px 13px", fontSize: 13, fontWeight: 700 }}>{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* sources marquee */}
        <section style={{ ...section, marginTop: 96 }}>
          <p style={overline}>Straight from the source</p>
          <h2 style={{ ...h2Style, marginBottom: 0 }}>Open roles currently listed on RoleOwl</h2>
        </section>
        <div style={{ maxWidth: 1080, margin: "24px auto 0", padding: "0 24px", overflow: "hidden" }}>
          <div style={{ overflow: "hidden", padding: "8px 0 4px", maskImage: "linear-gradient(90deg,transparent,black 4%,black 96%,transparent)" }}>
            <div style={{ display: "flex", gap: 16, width: "max-content", animation: "rmarquee 26s linear infinite" }}>
              {marqueeDoubled.map((m, i) => (
                <div key={i} style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10, ...card, borderRadius: "var(--radius-2xl)", padding: "12px 18px" }}>
                  <span style={{ height: 30, width: 30, borderRadius: "50%", background: "var(--stone-200)", color: "var(--stone-600)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{m.company.charAt(0)}</span>
                  <div><p style={{ margin: 0, fontSize: 13, fontWeight: 800, lineHeight: 1.2 }}>{m.role}</p><p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "var(--text-faint)" }}>{m.company} · {m.loc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* about */}
        <section id="about" style={section}>
          <p style={overline}>About</p>
          <h2 style={h2Style}>Why RoleOwl exists</h2>
          <div className="r-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--stone-700)", lineHeight: 1.6 }}>Most job boards are slow. By the time a role is posted publicly, it has often been live on the company&apos;s own hiring system for a while, and a good number of candidates already applied. RoleOwl closes that gap. It reads the hiring systems companies actually use, so new roles reach you sooner.</p>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--stone-700)", lineHeight: 1.6 }}>To get the most out of it: set the exact roles and locations you&apos;re hunting for, keep your preferences current as your search evolves, and act on your digest while the roles are still fresh. The more specific your filters, the sharper the matches.</p>
          </div>
        </section>

        {/* features */}
        <section style={section}>
          <p style={{ ...overline, textAlign: "center" }}>Why RoleOwl</p>
          <h2 style={{ ...h2Style, textAlign: "center", marginBottom: 40 }}>Built to find roles before anyone else does</h2>
          <div className="r-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{ ...card, padding: "28px 24px" }}>
                <FeatureIcon>{f.path}</FeatureIcon>
                <p style={{ margin: "0 0 8px", fontWeight: 800, fontSize: 16 }}>{f.title}</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-muted)", lineHeight: 1.5 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* how it works */}
        <section style={section}>
          <p style={{ ...overline, textAlign: "center" }}>How it works</p>
          <h2 style={{ ...h2Style, textAlign: "center", marginBottom: 40 }}>Four steps to a head start</h2>
          <div className="r-grid-4" style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
            {/* Animated flow line threading the step badges (centers at 12.5/37.5/62.5/87.5%).
                Sits behind the badges (zIndex 0); hidden on the stacked mobile grid. */}
            <svg
              className="r-flowline"
              aria-hidden="true"
              viewBox="0 0 100 4"
              preserveAspectRatio="none"
              style={{ position: "absolute", top: 24, left: 0, width: "100%", height: 4, zIndex: 0, overflow: "visible" }}
            >
              <line x1="12.5" y1="2" x2="87.5" y2="2" stroke="var(--grape-300)" strokeWidth="2" strokeDasharray="4 5" strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ animation: "rflow 1s linear infinite" }} />
            </svg>
            {STEPS.map((s) => (
              <div key={s.n} style={{ position: "relative", textAlign: "center" }}>
                <div style={{ position: "relative", zIndex: 1, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: "50%", background: "var(--grape-700)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, animation: "rstepglow 3s ease-in-out infinite" }}>{s.n}</div>
                <p style={{ margin: "0 0 6px", fontWeight: 800, fontSize: 15 }}>{s.t}</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--text-muted)", lineHeight: 1.5 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* privacy */}
        <section style={section}>
          <p style={{ ...overline, textAlign: "center" }}>Security &amp; privacy</p>
          <h2 style={{ ...h2Style, textAlign: "center", marginBottom: 32 }}>Your data stays yours</h2>
          <div className="r-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {PRIVACY.map((p) => (
              <div key={p.t} style={{ ...card, padding: "24px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "50%", background: "var(--emerald-100)", color: "var(--emerald-700)", marginBottom: 14 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{p.path}</svg>
                </div>
                <p style={{ margin: "0 0 8px", fontWeight: 800, fontSize: 15 }}>{p.t}</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-muted)", lineHeight: 1.5 }}>{p.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" style={section}>
          <div className="r-faq" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 48, alignItems: "start" }}>
            <div>
              <p style={overline}>FAQ</p>
              <h2 style={{ ...h2Style, fontSize: 30, marginBottom: 16 }}>Questions the owl gets asked</h2>
              <OwlMascot variant="happy" size={96} style={{ animation: "rbob 4.5s ease-in-out infinite" }} />
            </div>
            <div>
              {FAQS.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div key={f.q} onClick={() => setOpenFaq(open ? -1 : i)} style={{ ...card, borderRadius: "var(--radius-2xl)", marginBottom: 12, padding: "18px 22px", cursor: "pointer", boxShadow: open ? "var(--shadow-soft-md)" : "var(--shadow-soft-xs)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%", background: "var(--amber-200)", color: "var(--amber-950)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>{open ? "–" : "+"}</span>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: 15 }}>{f.q}</p>
                    </div>
                    {open && <p style={{ margin: "12px 0 0 42px", fontSize: 14, fontWeight: 600, color: "var(--stone-600)", lineHeight: 1.5 }}>{f.a}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* final CTA */}
        <section style={{ ...section, padding: "0 24px 96px" }}>
          <div style={{ borderRadius: 28, background: "linear-gradient(135deg,var(--grape-700),var(--grape-600))", boxShadow: "var(--shadow-soft-lg)", padding: "32px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <OwlMascot variant="happy" size={44} />
              <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "#fff", letterSpacing: "var(--tracking-tight)" }}>Let the owl start hunting for you.</h3>
            </div>
            <Link href={primaryHref} style={{ textDecoration: "none" }}><Button size="lg">{primaryLabel}</Button></Link>
          </div>
        </section>

        {/* footer */}
        <footer style={{ maxWidth: 1080, margin: "0 auto", padding: "56px 24px 72px", borderTop: "1px solid var(--stone-200)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1.2fr", gap: 40, alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <OwlMascot size={40} />
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: "var(--text-primary)" }}>RoleOwl</span>
              </div>
              <p style={{ margin: "12px 0 0", fontSize: 13, fontWeight: 600, color: "var(--text-muted)", lineHeight: 1.5, maxWidth: 230 }}>Find jobs before the crowd does. The owl hunts so you don&apos;t have to.</p>
            </div>
            <div>
              <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 800, letterSpacing: "var(--tracking-widest)", textTransform: "uppercase", color: "var(--text-faint)" }}>Product</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: 13, fontWeight: 700 }}>
                <Link href="/register" style={{ textDecoration: "none", color: "var(--grape-600)" }}>Create an account</Link>
                <Link href="/login" style={{ textDecoration: "none", color: "var(--grape-600)" }}>Log in</Link>
                <a href="#faq" style={{ textDecoration: "none", color: "var(--grape-600)" }}>Questions &amp; answers</a>
              </div>
            </div>
            <div>
              <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 800, letterSpacing: "var(--tracking-widest)", textTransform: "uppercase", color: "var(--text-faint)" }}>Your data</p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8, fontSize: 13, fontWeight: 600, color: "var(--text-muted)", lineHeight: 1.5 }}>
                <li>Free — no card, no trial clock.</li>
                <li>We store your email and preferences, nothing else.</li>
                <li>Delete your account anytime in Settings.</li>
              </ul>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap", marginTop: 44, paddingTop: 24, borderTop: "1px solid var(--stone-200)" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-faint)" }}>© 2026 RoleOwl · roleowl.org</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-faint)" }}>Built for people who apply early.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
