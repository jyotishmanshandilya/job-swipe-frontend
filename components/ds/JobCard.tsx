"use client";

import React from "react";

export interface JobCardProps {
  title: string;
  company: string;
  ats: string;
  /** Single-letter company avatar fallback. */
  initial: string;
  meta?: string[];
  /** e.g. "new tonight ✦" — hidden when viewed is true. */
  badge?: string;
  viewed?: boolean;
  onView?: () => void;
}

export function JobCard({ title, company, ats, initial, meta = [], badge, viewed = false, onView }: JobCardProps) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: "var(--radius-3xl)",
        border: "none",
        background: "var(--surface-card)",
        boxShadow: hover ? "var(--shadow-soft-md)" : "var(--shadow-soft-sm)",
        padding: 20,
        opacity: viewed ? 0.9 : 1,
        fontFamily: "var(--font-body)",
        transform: hover ? "translateY(-3px)" : "translateY(0)",
        transition: "box-shadow .25s var(--ease-standard),transform .25s var(--ease-standard)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ height: 36, width: 36, borderRadius: "var(--radius-xl)", background: "var(--grape-100)", color: "var(--grape-700)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>
            {initial}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, lineHeight: 1.2, color: viewed ? "var(--stone-600)" : "var(--text-primary)" }}>{title}</p>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: viewed ? "var(--text-faint)" : "var(--text-muted)" }}>
              {company} · {ats}
            </p>
          </div>
        </div>
        {viewed ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, borderRadius: "var(--radius-lg)", background: "var(--emerald-100)", color: "var(--emerald-700)", padding: "2px 8px", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
            ✓ Viewed
          </span>
        ) : (
          badge && (
            <span style={{ flexShrink: 0, transform: "rotate(2deg)", borderRadius: "var(--radius-lg)", border: "none", background: "var(--amber-300)", color: "var(--amber-950)", padding: "2px 8px", fontSize: 11, fontWeight: 800, boxShadow: "var(--shadow-soft-xs)" }}>
              {badge}
            </span>
          )
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
        {meta.map((m, i) => (
          <span key={i} style={{ border: "1.5px solid var(--stone-200)", borderRadius: "var(--radius-lg)", padding: "2px 9px", fontSize: 12, fontWeight: 700, color: "var(--stone-600)", background: "#fafaf9" }}>
            {m}
          </span>
        ))}
      </div>
      <button
        onClick={onView}
        style={{
          marginTop: 16,
          width: "100%",
          borderRadius: "var(--radius-2xl)",
          padding: "10px 0",
          fontSize: 14,
          fontWeight: 800,
          fontFamily: "var(--font-body)",
          cursor: "pointer",
          border: "none",
          ...(viewed
            ? { background: "var(--surface-canvas)", color: "var(--stone-600)" }
            : { background: "var(--brand-primary)", color: "var(--brand-primary-text)", boxShadow: "var(--shadow-soft-sm)" }),
        }}
      >
        {viewed ? "View again →" : "View role →"}
      </button>
    </div>
  );
}
