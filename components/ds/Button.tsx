"use client";

import React from "react";

export interface ButtonProps {
  /** Visual style. Default 'primary'. */
  variant?: "primary" | "secondary" | "grape" | "danger";
  /** Size. Default 'md'. */
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  /** Stretch to fill the container width. */
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  style?: React.CSSProperties;
}

const VARIANTS = {
  primary: { bg: "var(--brand-primary)", hoverBg: "var(--brand-primary-hover)", text: "var(--brand-primary-text)" },
  secondary: { bg: "var(--surface-card)", hoverBg: "#fafaf9", text: "var(--stone-700)" },
  grape: { bg: "var(--grape-600)", hoverBg: "var(--grape-500)", text: "#ffffff" },
  danger: { bg: "var(--rose-500)", hoverBg: "var(--rose-400)", text: "#ffffff" },
} as const;

const SIZES = {
  sm: { padding: ".3rem .85rem", fontSize: ".8rem" },
  md: { padding: ".6rem 1.15rem", fontSize: ".875rem" },
  lg: { padding: ".85rem 1.7rem", fontSize: "1rem" },
} as const;

export function Button({ variant = "primary", size = "md", disabled = false, fullWidth = false, children, onClick, type = "button", className, style }: ButtonProps) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={className}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: "var(--font-body)",
        fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer",
        borderRadius: "var(--radius-2xl)",
        border: "none",
        background: disabled ? v.bg : hover ? v.hoverBg : v.bg,
        color: v.text,
        padding: s.padding,
        fontSize: s.fontSize,
        width: fullWidth ? "100%" : undefined,
        opacity: disabled ? 0.6 : 1,
        boxShadow: hover && !disabled ? "var(--shadow-soft-md)" : "var(--shadow-soft-sm)",
        transform: hover && !disabled ? "translateY(-2px)" : "translateY(0)",
        transition: "box-shadow .25s var(--ease-standard),transform .25s var(--ease-standard),background .2s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
