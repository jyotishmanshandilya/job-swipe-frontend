"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/**
 * Centered dialog over a dimmed backdrop for the `.rds` language. Rendered
 * through a portal to <body>, so it self-applies `.rds` to resolve tokens
 * (ancestors with transform/backdrop-filter would otherwise clip a fixed
 * overlay). Closes on Escape or backdrop click.
 */
export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="rds"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgb(41 37 36 / 0.5)", backdropFilter: "blur(2px)" }}
      />
      <div
        style={{
          position: "relative",
          maxHeight: "85vh",
          width: "100%",
          maxWidth: 384,
          overflowY: "auto",
          borderRadius: "var(--radius-2xl)",
          background: "var(--surface-card)",
          boxShadow: "var(--shadow-soft-lg)",
          padding: 24,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: "var(--tracking-tight)", color: "var(--text-primary)" }}>{title}</h2>
        <div style={{ marginTop: 12 }}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
