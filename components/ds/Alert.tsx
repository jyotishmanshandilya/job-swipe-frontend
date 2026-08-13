"use client";

import React from "react";

export interface AlertProps {
  /** Default 'success'. `error` is an alias of `danger`; `info` is a blue tone. */
  kind?: "success" | "warning" | "danger" | "error" | "info";
  children: React.ReactNode;
}

const KINDS = {
  success: { bg: "var(--semantic-success-bg)", border: "var(--semantic-success-border)", text: "var(--semantic-success-text)", icon: "✓" },
  warning: { bg: "var(--semantic-warning-bg)", border: "var(--semantic-warning-border)", text: "var(--semantic-warning-text)", icon: "" },
  danger: { bg: "var(--semantic-danger-bg)", border: "var(--semantic-danger-border)", text: "var(--semantic-danger-text)", icon: "" },
  error: { bg: "var(--semantic-danger-bg)", border: "var(--semantic-danger-border)", text: "var(--semantic-danger-text)", icon: "" },
  info: { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", icon: "" },
} as const;

export function Alert({ kind = "success", children }: AlertProps) {
  const k = KINDS[kind] || KINDS.success;
  return (
    <div
      style={{
        borderRadius: "var(--radius-xl)",
        border: `1.5px solid ${k.border}`,
        background: k.bg,
        color: k.text,
        padding: "10px 14px",
        fontSize: 14,
        fontWeight: 700,
        fontFamily: "var(--font-body)",
        boxShadow: "var(--shadow-soft-xs)",
      }}
    >
      {k.icon ? `${k.icon} ` : ""}
      {children}
    </div>
  );
}
