// Standalone copy of components/OwlMascot.tsx as a raw SVG string, used to
// export transparent PNGs. Keep the shapes in sync with the component.
function owlSvg(variant = "happy") {
  const eyes =
    variant === "happy"
      ? `
      <circle cx="43" cy="48" r="17" fill="#FFFFFF" />
      <circle cx="77" cy="48" r="17" fill="#FFFFFF" />
      <circle cx="45" cy="50" r="7.5" fill="#1C1917" />
      <circle cx="75" cy="50" r="7.5" fill="#1C1917" />
      <circle cx="47.5" cy="47" r="2.5" fill="#FFFFFF" />
      <circle cx="77.5" cy="47" r="2.5" fill="#FFFFFF" />`
      : `
      <path d="M32 50 Q43 59 54 50" stroke="#1C1917" stroke-width="3.5" stroke-linecap="round" fill="none" />
      <path d="M66 50 Q77 59 88 50" stroke="#1C1917" stroke-width="3.5" stroke-linecap="round" fill="none" />
      <text x="96" y="26" font-size="16" font-weight="800" fill="#B45309" font-family="sans-serif">z</text>
      <text x="106" y="16" font-size="11" font-weight="800" fill="#D97706" font-family="sans-serif">z</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <path d="M30 24 L39 6 L49 21 Z" fill="#B45309" />
    <path d="M90 24 L81 6 L71 21 Z" fill="#B45309" />
    <rect x="16" y="14" width="88" height="98" rx="44" fill="#D97706" />
    <ellipse cx="21" cy="72" rx="9" ry="20" fill="#B45309" />
    <ellipse cx="99" cy="72" rx="9" ry="20" fill="#B45309" />
    <ellipse cx="60" cy="88" rx="29" ry="20" fill="#FDE68A" />
    ${eyes}
    <path d="M52 58 L68 58 L60 70 Z" fill="#F97316" />
    <ellipse cx="48" cy="112" rx="7" ry="5" fill="#F97316" />
    <ellipse cx="72" cy="112" rx="7" ry="5" fill="#F97316" />
  </svg>`;
}
module.exports = { owlSvg };
