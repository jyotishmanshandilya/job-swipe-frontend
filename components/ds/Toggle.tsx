"use client";

import React from "react";

export interface ToggleProps {
  checked?: boolean;
  label?: string;
  /** Optional helper text under the label — switches to the block row layout. */
  description?: string;
  onChange?: (checked: boolean) => void;
}

function Switch({ checked, onChange }: { checked: boolean; onChange?: (v: boolean) => void }) {
  return (
    <span
      role="switch"
      aria-checked={checked}
      onClick={() => onChange && onChange(!checked)}
      style={{
        display: "inline-flex",
        height: 28,
        width: 48,
        flexShrink: 0,
        alignItems: "center",
        borderRadius: "var(--radius-full)",
        background: checked ? "var(--brand-primary)" : "var(--stone-300)",
        padding: 4,
        cursor: "pointer",
        transition: "background .15s",
      }}
    >
      <span
        style={{
          height: 20,
          width: 20,
          borderRadius: "var(--radius-full)",
          background: "#fff",
          boxShadow: "0 1px 2px rgb(0 0 0 / .2)",
          transform: checked ? "translateX(20px)" : "translateX(0)",
          transition: "transform .15s",
        }}
      />
    </span>
  );
}

export function Toggle({ checked = false, label, description, onChange }: ToggleProps) {
  // With a description, lay it out as a full-width row (label/desc left, switch
  // right) — how the preferences + settings forms use it.
  if (description) {
    return (
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--stone-700)", fontFamily: "var(--font-body)" }}>{label}</p>
          <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>{description}</p>
        </div>
        <Switch checked={checked} onChange={onChange} />
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Switch checked={checked} onChange={onChange} />
      {label && (
        <span style={{ fontSize: 14, fontWeight: 700, color: checked ? "var(--stone-700)" : "var(--text-faint)", fontFamily: "var(--font-body)" }}>{label}</span>
      )}
    </div>
  );
}
