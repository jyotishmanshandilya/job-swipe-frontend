/**
 * Tiny inline-SVG doodle set for the "Balanced Quirk" look — hand-drawn accents
 * scattered on the landing page and empty states. All are decorative
 * (aria-hidden), sized via `size`, and colored via `color` (defaults to
 * currentColor so they inherit text color; pass a hex for amber/grape).
 */

type DoodleProps = {
  size?: number;
  color?: string;
  className?: string;
  strokeWidth?: number;
};

/** A loose hand-drawn squiggle — used as an active-link underline. */
export function Squiggle({
  size = 48,
  color = "currentColor",
  className = "",
  strokeWidth = 3,
}: DoodleProps) {
  return (
    <svg
      width={size}
      height={(size * 12) / 48}
      viewBox="0 0 48 12"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M2 8C6 3 10 3 14 8s8 5 12 0 8-5 12 0"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** A chunky four-point sparkle star. */
export function Star({
  size = 32,
  color = "currentColor",
  className = "",
}: DoodleProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 1c.7 4.8 2.7 6.8 7.5 7.5C14.7 9.2 12.7 11.2 12 16c-.7-4.8-2.7-6.8-7.5-7.5C9.3 7.8 11.3 5.8 12 1z"
        fill={color}
      />
    </svg>
  );
}

