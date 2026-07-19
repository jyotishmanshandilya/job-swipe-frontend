/**
 * Landing-page marquee: a strip of sample roles scrolling past, like the owl
 * dragging home the night's haul. Pre-auth page, so these are honest mockups
 * (same pattern as DIGEST_JOBS) — labeled as a sample, not live data.
 *
 * The track renders twice and the `marquee` keyframe scrolls -50%, so the loop
 * is seamless. Pauses on hover; frozen entirely by prefers-reduced-motion.
 */

const TICKER_ROLES = [
  { title: "Backend Engineer", where: "Mosaic Pay · Bengaluru" },
  { title: "SDE II", where: "Cartwheel · Remote, India" },
  { title: "Frontend Engineer", where: "Juniper Health · Pune" },
  { title: "Data Engineer", where: "Lumen Labs · Hyderabad" },
  { title: "DevOps Engineer", where: "Nimbus · Gurugram" },
  { title: "Product Engineer", where: "Paperkite · Bengaluru" },
  { title: "ML Engineer", where: "Verdant AI · Remote, India" },
  { title: "QA Engineer", where: "Hatchling · Chennai" },
];

export default function JobTicker() {
  const track = (ariaHidden: boolean) => (
    <ul
      aria-hidden={ariaHidden || undefined}
      className="flex shrink-0 items-center gap-3 pr-3"
    >
      {TICKER_ROLES.map((r) => (
        <li
          key={r.title}
          className="flex shrink-0 items-baseline gap-2 rounded-xl border-2 border-stone-200 bg-white px-3.5 py-1.5"
        >
          <span className="text-sm font-extrabold text-stone-800">
            {r.title}
          </span>
          <span className="text-xs font-semibold text-stone-400">
            {r.where}
          </span>
        </li>
      ))}
      <li
        aria-hidden="true"
        className="shrink-0 px-2 text-amber-400"
      >
        ✦
      </li>
    </ul>
  );

  return (
    <section className="mt-6">
      <p className="text-center text-xs font-bold uppercase tracking-widest text-stone-400">
        A sample of last night&apos;s haul
      </p>
      <div className="relative mt-3 overflow-hidden">
        {/* cream fade at both edges so chips slide in from nothing */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#FFF8ED] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#FFF8ED] to-transparent" />
        <div className="marquee flex w-max">
          {track(false)}
          {track(true)}
        </div>
      </div>
    </section>
  );
}
