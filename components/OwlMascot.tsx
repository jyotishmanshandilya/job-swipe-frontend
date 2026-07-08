/**
 * The RoleOwl mascot, as hand-drawn SVG so it scales anywhere.
 * - "happy": default — big curious eyes (logo, CTAs, success states)
 * - "sleepy": closed eyes + zzz — empty states ("the owl found nothing new")
 */
export default function OwlMascot({
  size = 96,
  variant = "happy",
  className = "",
}: {
  size?: number;
  variant?: "happy" | "sleepy";
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      aria-hidden="true"
    >
      {/* ear tufts */}
      <path d="M30 24 L39 6 L49 21 Z" fill="#B45309" />
      <path d="M90 24 L81 6 L71 21 Z" fill="#B45309" />
      {/* body */}
      <rect x="16" y="14" width="88" height="98" rx="44" fill="#D97706" />
      {/* wings */}
      <ellipse cx="21" cy="72" rx="9" ry="20" fill="#B45309" />
      <ellipse cx="99" cy="72" rx="9" ry="20" fill="#B45309" />
      {/* belly */}
      <ellipse cx="60" cy="88" rx="29" ry="20" fill="#FDE68A" />
      {/* eyes */}
      {variant === "happy" ? (
        <>
          <circle cx="43" cy="48" r="17" fill="#FFFFFF" />
          <circle cx="77" cy="48" r="17" fill="#FFFFFF" />
          <circle cx="45" cy="50" r="7.5" fill="#1C1917" />
          <circle cx="75" cy="50" r="7.5" fill="#1C1917" />
          <circle cx="47.5" cy="47" r="2.5" fill="#FFFFFF" />
          <circle cx="77.5" cy="47" r="2.5" fill="#FFFFFF" />
        </>
      ) : (
        <>
          <path
            d="M32 50 Q43 59 54 50"
            stroke="#1C1917"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M66 50 Q77 59 88 50"
            stroke="#1C1917"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <text x="96" y="26" fontSize="16" fontWeight="800" fill="#B45309">
            z
          </text>
          <text x="106" y="16" fontSize="11" fontWeight="800" fill="#D97706">
            z
          </text>
        </>
      )}
      {/* beak */}
      <path d="M52 58 L68 58 L60 70 Z" fill="#F97316" />
      {/* feet */}
      <ellipse cx="48" cy="112" rx="7" ry="5" fill="#F97316" />
      <ellipse cx="72" cy="112" rx="7" ry="5" fill="#F97316" />
    </svg>
  );
}
