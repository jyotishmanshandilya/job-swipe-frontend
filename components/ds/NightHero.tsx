"use client";

import React from "react";
import { OwlMascot } from "./OwlMascot";

export interface NightHeroProps {
  title?: string;
  highlight?: string;
  kicker?: string;
  subtitle?: string;
  stat?: string;
  primaryCta?: string;
  secondaryCta?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
}

export function NightHero({
  title = "The owl hunts",
  highlight = "while you sleep.",
  kicker = "Reads the ATS. Not the job boards.",
  subtitle,
  stat = "9,400+ roles surfaced this week",
  primaryCta = "Start free",
  secondaryCta = "Log in",
  onPrimary,
  onSecondary,
}: NightHeroProps) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 32,
        border: "none",
        background: "linear-gradient(150deg,var(--night-bg-start),var(--night-bg-end))",
        padding: "56px 48px",
        fontFamily: "var(--font-body)",
        boxShadow: "var(--shadow-soft-lg)",
      }}
    >
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgb(255 255 255 / .5) 1px,transparent 1.5px)", backgroundSize: "26px 26px", opacity: 0.18 }} />
      <span style={{ position: "absolute", left: 40, top: 40, fontSize: 12, color: "var(--night-star)" }}>✦</span>
      <span style={{ position: "absolute", left: "38%", top: 28, fontSize: 9, color: "var(--amber-200)" }}>✦</span>
      <span style={{ position: "absolute", left: "54%", top: 96, fontSize: 8, color: "var(--night-lilac)" }}>✦</span>
      <span style={{ position: "absolute", right: 210, top: 132, fontSize: 10, color: "var(--night-star)" }}>✦</span>
      <svg style={{ position: "absolute", right: 44, top: 36 }} width={46} height={46} viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="18" fill="var(--night-glow)" />
        <circle cx="30" cy="16" r="16" fill="var(--night-moon-crescent)" />
      </svg>
      <svg style={{ position: "absolute", left: 0, right: 0, bottom: -2, width: "100%", height: 92 }} viewBox="0 0 800 120" preserveAspectRatio="none">
        <path d="M0 70 Q120 30 260 60 T520 50 T800 68 L800 120 L0 120 Z" fill="var(--grape-800)" opacity=".55" />
        <path d="M0 95 Q160 60 340 90 T680 80 T800 92 L800 120 L0 120 Z" fill="var(--grape-900)" />
        <rect x="120" y="86" width="6" height="8" fill="var(--night-star)" opacity=".5" />
        <rect x="300" y="70" width="6" height="8" fill="var(--night-star)" opacity=".4" />
        <rect x="560" y="76" width="6" height="8" fill="var(--night-star)" opacity=".45" />
      </svg>
      <div style={{ position: "absolute", inset: "auto 0 0 0", height: 96, background: "linear-gradient(to top, rgb(251 191 36 / .18), transparent)", pointerEvents: "none" }} />
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40, flexWrap: "wrap" }}>
        <div style={{ maxWidth: 440 }}>
          <p style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 800, letterSpacing: "var(--tracking-widest)", textTransform: "uppercase", color: "var(--night-star)" }}>{kicker}</p>
          <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 800, lineHeight: 1.05, letterSpacing: "var(--tracking-tight)", color: "var(--night-text)" }}>
            {title}
            <br />
            <span style={{ color: "var(--night-star)" }}>{highlight}</span>
          </h1>
          {subtitle && <p style={{ margin: "16px 0 0", fontSize: 16, fontWeight: 600, color: "var(--night-lilac)", maxWidth: 400 }}>{subtitle}</p>}
          <div style={{ display: "flex", gap: 14, marginTop: 26, alignItems: "center" }}>
            <button onClick={onPrimary} style={{ borderRadius: "var(--radius-2xl)", border: "none", background: "var(--brand-primary)", color: "var(--brand-primary-text)", padding: "11px 22px", fontSize: 14, fontWeight: 800, boxShadow: "var(--shadow-soft-md)", cursor: "pointer", fontFamily: "var(--font-body)" }}>{primaryCta}</button>
            <span onClick={onSecondary} style={{ fontSize: 14, fontWeight: 800, color: "var(--night-lilac)", cursor: "pointer", borderBottom: "2px solid var(--night-btn-border)", paddingBottom: 2 }}>{secondaryCta} →</span>
          </div>
          {stat && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 28, borderRadius: "var(--radius-full)", border: "1px solid var(--glass-border)", background: "var(--glass-bg)", backdropFilter: "blur(var(--blur-md))", padding: "6px 14px 6px 8px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--emerald-300)", boxShadow: "0 0 8px var(--emerald-300)" }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: "var(--night-text)" }}>{stat}</span>
            </div>
          )}
        </div>
        <div style={{ position: "relative", flexShrink: 0, width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", width: 190, height: 190, borderRadius: "50%", background: "radial-gradient(circle,rgb(253 230 138 / .28) 0%,transparent 72%)" }} />
          <OwlMascot variant="happy" size={190} style={{ position: "relative", filter: "drop-shadow(0 16px 24px rgb(0 0 0 / .45))", animation: "rbob 4.5s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: 6, right: -6, borderRadius: "var(--radius-full)", border: "none", background: "var(--night-text)", padding: "4px 10px", fontSize: 11, fontWeight: 800, color: "var(--grape-800)", boxShadow: "var(--shadow-soft-sm)", transform: "rotate(-4deg)" }}>on the hunt</div>
        </div>
      </div>
    </div>
  );
}
