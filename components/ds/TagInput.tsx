"use client";

import React from "react";

export interface TagInputProps {
  label?: string;
  /** Current chips. */
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  /** Dashed "+ chip" suggestions shown below the field. */
  suggestions?: string[];
}

/**
 * Functional chip input for the `.rds` language: type a value and press Enter
 * (or click a suggestion) to append a chip. Matches the API of the old
 * ui.tsx TagInput so it drops into PreferencesForm unchanged.
 */
export function TagInput({ label, values, onChange, placeholder = "Add a role…", suggestions = [] }: TagInputProps) {
  const add = (raw: string) => {
    const v = raw.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
  };
  return (
    <div>
      {label && (
        <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "var(--stone-700)", marginBottom: 4 }}>{label}</label>
      )}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          borderRadius: "var(--radius-xl)",
          border: "1.5px solid var(--border-default)",
          background: "var(--surface-card)",
          padding: 8,
          boxShadow: "var(--shadow-soft-xs)",
        }}
      >
        {values.map((t) => (
          <span
            key={t}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              borderRadius: "var(--radius-xl)",
              border: "none",
              background: "var(--amber-200)",
              color: "var(--amber-950)",
              padding: "4px 12px",
              fontSize: 14,
              fontWeight: 800,
              boxShadow: "var(--shadow-soft-xs)",
              fontFamily: "var(--font-body)",
            }}
          >
            {t}
            <button
              type="button"
              aria-label={`Remove ${t}`}
              onClick={() => onChange(values.filter((x) => x !== t))}
              style={{ background: "none", border: "none", color: "var(--stone-500)", cursor: "pointer", fontSize: 15, lineHeight: 1, padding: 0 }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(e.currentTarget.value);
              e.currentTarget.value = "";
            }
          }}
          style={{ flex: 1, minWidth: 96, background: "transparent", border: "none", outline: "none", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-body)", color: "var(--text-primary)" }}
        />
      </div>
      {suggestions.length > 0 && (
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {suggestions
            .filter((s) => !values.includes(s))
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => add(s)}
                style={{ cursor: "pointer", borderRadius: "var(--radius-full)", border: "1.5px dashed var(--border-default)", background: "transparent", padding: "2px 10px", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", fontFamily: "var(--font-body)" }}
              >
                + {s}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
