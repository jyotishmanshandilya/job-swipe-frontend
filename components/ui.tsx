"use client";

import { InputHTMLAttributes, ButtonHTMLAttributes } from "react";
import OwlMascot from "./OwlMascot";

export function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-bold text-stone-700 mb-1"
    >
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border-2 border-stone-200 bg-white px-3.5 py-2.5 text-sm
        text-stone-800 placeholder-stone-400 focus:border-amber-400 focus:outline-none
        focus:ring-2 focus:ring-amber-200 disabled:bg-stone-100 disabled:text-stone-500
        ${props.className ?? ""}`}
    />
  );
}

/** Chunky "pressable" buttons: thick bottom border that collapses on press. */
export function Button({
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
}) {
  const styles = {
    primary:
      "bg-amber-400 text-amber-950 border-amber-600 hover:bg-amber-300 disabled:bg-amber-200 disabled:text-amber-700 disabled:border-amber-300",
    secondary:
      "bg-white text-stone-700 border-stone-300 hover:bg-stone-50 disabled:text-stone-400",
    danger:
      "bg-rose-500 text-white border-rose-700 hover:bg-rose-400 disabled:bg-rose-300 disabled:border-rose-400",
  }[variant];
  return (
    <button
      {...props}
      className={`cursor-pointer rounded-2xl border-2 border-b-4 px-4 py-2 text-sm font-extrabold
        transition-all active:border-b-2 active:translate-y-[2px] disabled:cursor-not-allowed
        disabled:active:translate-y-0 disabled:active:border-b-4 ${styles} ${props.className ?? ""}`}
    />
  );
}

export function Alert({
  kind,
  children,
}: {
  kind: "error" | "success" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    error: "bg-rose-50 text-rose-700 border-rose-200",
    success: "bg-teal-50 text-teal-700 border-teal-200",
    info: "bg-sky-50 text-sky-700 border-sky-200",
  }[kind];
  return (
    <div className={`rounded-xl border-2 px-3.5 py-2.5 text-sm font-semibold ${styles}`}>
      {children}
    </div>
  );
}

/** Card shell used by the auth pages: owl on top, rounded card below. */
export function AuthShell({
  title,
  subtitle,
  variant = "happy",
  children,
}: {
  title: string;
  subtitle?: string;
  variant?: "happy" | "sleepy";
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rise rounded-3xl border-2 border-stone-200 border-b-4 bg-white p-8">
        <div className="flex justify-center">
          <OwlMascot size={72} variant={variant} />
        </div>
        <h1 className="mt-4 text-center text-2xl font-extrabold text-stone-800">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-center text-sm text-stone-500">{subtitle}</p>
        )}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

/** Tag input: type a value, press Enter or click Add to append a chip. */
export function TagInput({
  label,
  values,
  onChange,
  placeholder,
  suggestions = [],
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}) {
  const add = (raw: string) => {
    const v = raw.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((v) => (
          <span
            key={v}
            className="pop-in inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-900"
          >
            {v}
            <button
              type="button"
              aria-label={`Remove ${v}`}
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="cursor-pointer text-amber-500 hover:text-amber-900"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <Input
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(e.currentTarget.value);
            e.currentTarget.value = "";
          }
        }}
      />
      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions
            .filter((s) => !values.includes(s))
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => add(s)}
                className="cursor-pointer rounded-full border-2 border-dashed border-stone-300 px-2.5 py-0.5 text-xs font-bold text-stone-500 hover:border-amber-400 hover:text-amber-700"
              >
                + {s}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  description,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-bold text-stone-700">{label}</p>
        {description && (
          <p className="text-xs text-stone-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
          checked ? "bg-teal-500" : "bg-stone-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-amber-200 border-t-amber-500" />
    </div>
  );
}
