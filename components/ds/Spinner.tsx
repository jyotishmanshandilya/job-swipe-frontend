"use client";

import React from "react";

/** Centered amber spinner for the `.rds` language. */
export function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
      <span
        style={{
          height: 32,
          width: 32,
          borderRadius: "var(--radius-full)",
          border: "3px solid var(--amber-200)",
          borderTopColor: "var(--amber-500)",
          animation: "rspin .7s linear infinite",
          display: "inline-block",
        }}
      />
    </div>
  );
}
