"use client";

import React from "react";

export interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
}

export function Label({ children, htmlFor }: LabelProps) {
  return (
    <label htmlFor={htmlFor} style={{ display: "block", fontSize: 14, fontWeight: 700, color: "var(--stone-700)", marginBottom: 4 }}>
      {children}
    </label>
  );
}
