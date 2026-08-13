"use client";

import React from "react";
import { OwlMascot } from "./OwlMascot";

export interface AuthShellProps {
  title: string;
  subtitle?: string;
  /** Owl mood shown at the top of the card. Default 'happy'. */
  variant?: "happy" | "sleepy";
  children: React.ReactNode;
}

/**
 * Card shell for the auth pages in the `.rds` language: soft-shadowed white
 * card on the cream canvas, owl mascot on top. Self-scopes with `.rds` so the
 * page it wraps doesn't need to add the class itself.
 */
export function AuthShell({ title, subtitle, variant = "happy", children }: AuthShellProps) {
  return (
    <div className="rds" style={{ maxWidth: 440, margin: "0 auto", padding: "48px 16px" }}>
      <div style={{ borderRadius: "var(--radius-3xl)", background: "var(--surface-card)", boxShadow: "var(--shadow-soft-lg)", padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <OwlMascot size={72} variant={variant} />
        </div>
        <h1 style={{ margin: "16px 0 0", textAlign: "center", fontSize: 26, fontWeight: 800, letterSpacing: "var(--tracking-tight)", color: "var(--text-primary)" }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: "6px 0 0", textAlign: "center", fontSize: 14, fontWeight: 600, color: "var(--text-muted)" }}>{subtitle}</p>
        )}
        <div style={{ marginTop: 24 }}>{children}</div>
      </div>
    </div>
  );
}
