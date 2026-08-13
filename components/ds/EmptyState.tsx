"use client";

import React from "react";
import { OwlMascot } from "./OwlMascot";

export interface EmptyStateProps {
  /** 'setup' = happy owl + CTA; 'sleepy' = no-results, sleeping owl. Default 'setup'. */
  kind?: "setup" | "sleepy";
  title?: string;
  message: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({ kind = "setup", title, message, ctaLabel, onCta }: EmptyStateProps) {
  const isSleepy = kind === "sleepy";
  return (
    <div style={{ borderRadius: "var(--radius-2xl)", border: "1.5px dashed var(--border-default)", background: "var(--surface-card)", padding: 32, textAlign: "center", fontFamily: "var(--font-body)" }}>
      <OwlMascot variant={isSleepy ? "sleepy" : "happy"} size={64} style={{ margin: "0 auto" }} />
      {title && <p style={{ marginTop: 12, fontWeight: 800, color: "var(--stone-700)" }}>{title}</p>}
      <p style={{ margin: "4px auto 0", maxWidth: 320, fontSize: 14, fontWeight: 600, color: "var(--text-muted)" }}>{message}</p>
      {ctaLabel && (
        <button
          onClick={onCta}
          style={{ marginTop: 16, borderRadius: "var(--radius-2xl)", border: "none", background: "var(--brand-primary)", color: "var(--brand-primary-text)", padding: "8px 20px", fontSize: 14, fontWeight: 800, boxShadow: "var(--shadow-soft-sm)", cursor: "pointer", fontFamily: "var(--font-body)" }}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
