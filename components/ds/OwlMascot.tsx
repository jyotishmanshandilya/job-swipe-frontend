"use client";

import React from "react";

export interface OwlMascotProps {
  variant?: "happy" | "sleepy";
  size?: number;
  glow?: boolean;
  style?: React.CSSProperties;
}

// Kept in sync with the exported design system's owl SVG.
export function OwlMascot({ variant = "happy", size = 120, glow = false, style }: OwlMascotProps) {
  const isSleepy = variant === "sleepy";
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0, ...style }}>
      {glow && (
        <div style={{ position: "absolute", inset: "-30%", borderRadius: "50%", background: "radial-gradient(circle,var(--night-glow) 0%,transparent 70%)", opacity: 0.5 }} />
      )}
      <svg viewBox="0 0 120 120" width={size} height={size} style={{ position: "relative", display: "block" }}>
        <path d="M30 24 L39 6 L49 21 Z" fill="#B45309" />
        <path d="M90 24 L81 6 L71 21 Z" fill="#B45309" />
        <rect x="16" y="14" width="88" height="98" rx="44" fill="#D97706" />
        <ellipse cx="21" cy="72" rx="9" ry="20" fill="#B45309" />
        <ellipse cx="99" cy="72" rx="9" ry="20" fill="#B45309" />
        <ellipse cx="60" cy="88" rx="29" ry="20" fill="#FDE68A" />
        {isSleepy ? (
          <React.Fragment>
            <path d="M32 50 Q43 59 54 50" stroke="#1C1917" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M66 50 Q77 59 88 50" stroke="#1C1917" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <text x="96" y="26" fontSize="16" fontWeight="800" fill="#B45309" fontFamily="sans-serif">z</text>
            <text x="106" y="16" fontSize="11" fontWeight="800" fill="#D97706" fontFamily="sans-serif">z</text>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <circle cx="43" cy="48" r="17" fill="#FFFFFF" />
            <circle cx="77" cy="48" r="17" fill="#FFFFFF" />
            <circle cx="45" cy="50" r="7.5" fill="#1C1917" />
            <circle cx="75" cy="50" r="7.5" fill="#1C1917" />
            <circle cx="47.5" cy="47" r="2.5" fill="#FFFFFF" />
            <circle cx="77.5" cy="47" r="2.5" fill="#FFFFFF" />
          </React.Fragment>
        )}
        <path d="M52 58 L68 58 L60 70 Z" fill="#F97316" />
        <ellipse cx="48" cy="112" rx="7" ry="5" fill="#F97316" />
        <ellipse cx="72" cy="112" rx="7" ry="5" fill="#F97316" />
      </svg>
    </div>
  );
}
