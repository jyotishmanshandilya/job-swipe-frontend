"use client";

import React from "react";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  /** 'error' forces the rose border/help styling. Default 'default'. */
  state?: "default" | "error";
  helpText?: string;
}

/**
 * Token-driven text input for the `.rds` design language. Spreads any native
 * input attribute (id/name/required/autoComplete/min…) so it drops in wherever
 * the old ui.tsx Input was used; internal focus state drives the amber ring.
 */
export function Input({ label, state = "default", helpText, id, className, style, onFocus, onBlur, disabled, ...rest }: InputProps) {
  const [focused, setFocused] = React.useState(false);
  const effective = state === "error" ? "error" : focused ? "focused" : "default";
  const borderColor = effective === "error" ? "var(--rose-400)" : effective === "focused" ? "var(--brand-primary)" : "var(--border-default)";
  const ring = effective === "focused" ? "0 0 0 4px rgb(252 211 77 / .35)" : "var(--shadow-soft-xs)";
  return (
    <div>
      {label && (
        <label htmlFor={id} style={{ display: "block", fontSize: 14, fontWeight: 700, color: effective === "error" ? "var(--rose-600)" : "var(--stone-700)", marginBottom: 4 }}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={className}
        disabled={disabled}
        {...rest}
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        style={{
          width: "100%",
          boxSizing: "border-box",
          borderRadius: "var(--radius-xl)",
          border: `1.5px solid ${borderColor}`,
          background: disabled ? "var(--stone-100)" : "var(--surface-card)",
          padding: "10px 14px",
          fontSize: 14,
          fontWeight: 600,
          outline: "none",
          boxShadow: ring,
          fontFamily: "var(--font-body)",
          color: disabled ? "var(--text-muted)" : "var(--text-primary)",
          cursor: disabled ? "not-allowed" : undefined,
          ...style,
        }}
      />
      {helpText && (
        <p style={{ margin: "4px 0 0", fontSize: 12, fontWeight: 700, color: effective === "error" ? "var(--rose-600)" : "var(--text-faint)" }}>{helpText}</p>
      )}
    </div>
  );
}
