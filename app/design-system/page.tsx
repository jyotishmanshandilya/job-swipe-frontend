"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Alert,
  Toggle,
  TagInput,
  JobCard,
  OwlMascot,
  EmptyState,
  NightHero,
} from "@/components/ds";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 48 }}>
      <p style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 800, letterSpacing: "var(--tracking-widest)", textTransform: "uppercase", color: "var(--text-faint)" }}>{title}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>{children}</div>
    </section>
  );
}

export default function DesignSystemShowcase() {
  const [digest, setDigest] = useState(true);
  const [tags, setTags] = useState(["Frontend Engineer", "Product Designer"]);

  return (
    <div className="rds" style={{ minHeight: "100vh", padding: "56px 24px 96px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <OwlMascot size={44} />
          <div>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: "var(--tracking-tight)" }}>RoleOwl design system</h1>
            <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 600, color: "var(--text-muted)" }}>Exported from Claude Design · live components</p>
          </div>
        </div>

        <Section title="Buttons">
          <Button variant="primary">Start free</Button>
          <Button variant="secondary">Log in</Button>
          <Button variant="grape">Get the digest</Button>
          <Button variant="danger">Delete account</Button>
          <Button disabled>Saving…</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </Section>

        <Section title="Forms">
          <div style={{ width: 280 }}>
            <Input label="Email" placeholder="you@email.com" defaultValue="jyoti@roleowl.org" />
          </div>
          <div style={{ width: 280 }}>
            <Input label="Password" type="password" state="error" defaultValue="short" helpText="At least 8 characters." />
          </div>
          <div style={{ width: 280 }}>
            <TagInput values={tags} onChange={setTags} placeholder="Add a role…" />
          </div>
          <Toggle label="Daily email digest" checked={digest} onChange={setDigest} />
        </Section>

        <Section title="Alerts">
          <div style={{ width: 320 }}>
            <Alert kind="success">Preferences saved.</Alert>
          </div>
          <div style={{ width: 320 }}>
            <Alert kind="warning">Set preferences to unlock matches.</Alert>
          </div>
          <div style={{ width: 320 }}>
            <Alert kind="danger">Something went wrong. Try again.</Alert>
          </div>
        </Section>

        <Section title="Feed">
          <div style={{ width: 320 }}>
            <JobCard title="Senior Frontend Engineer" company="Series B startup" ats="Greenhouse" initial="S" meta={["Remote, EU", "Full-time", "Senior"]} badge="new tonight ✦" />
          </div>
          <div style={{ width: 320 }}>
            <JobCard title="Staff Product Designer" company="Growth-stage co." ats="Lever" initial="G" meta={["Berlin", "Full-time"]} viewed />
          </div>
        </Section>

        <Section title="Patterns — owl mascot">
          <OwlMascot variant="happy" size={96} />
          <OwlMascot variant="sleepy" size={96} />
          <div style={{ width: 340 }}>
            <EmptyState kind="sleepy" title="Nothing new tonight" message="Even the owl came back empty-taloned for those filters. Loosen the search a little?" ctaLabel="Adjust preferences" />
          </div>
        </Section>

        <Section title="Patterns — night hero">
          <div style={{ width: "100%" }}>
            <NightHero
              title="Find jobs before"
              highlight="the crowd does."
              kicker="Reads the ATS. Not the job boards."
              subtitle="RoleOwl reads company hiring systems directly, so new roles reach you before the job boards catch up."
            />
          </div>
        </Section>
      </div>
    </div>
  );
}
