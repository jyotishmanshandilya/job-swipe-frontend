/**
 * Owl-flavored FAQ for the landing page. Native <details>/<summary> so it's
 * keyboard- and screen-reader-accessible with zero JS.
 */

const FAQS = [
  {
    q: "Will you spam me?",
    a: "One email, 8 AM, and only when the owl actually found something new. No streaks, no nudges, no “we miss you.” Owls don't grovel.",
  },
  {
    q: "Where do the jobs come from?",
    a: "Straight from 300+ company Greenhouse boards — the place roles appear first. LinkedIn picks the same postings up as much as 24 hours later.",
  },
  {
    q: "Is it really free?",
    a: "Yes. The owl works for the thrill of the hunt (and because job hunting is miserable enough without a paywall).",
  },
  {
    q: "What if the matches are off?",
    a: "Tweak your titles, cities, and experience range in Settings anytime — the very next morning's digest uses the new preferences.",
  },
  {
    q: "How do I make it stop?",
    a: "One click to unsubscribe, right in the email footer. The owl will be sad, but quietly, and far away from your inbox.",
  },
];

export default function Faq() {
  return (
    <section className="pb-16 md:pb-20">
      <h2 className="text-center text-3xl font-extrabold tracking-tight text-stone-800">
        Sensible questions, owl answers
      </h2>
      <div className="mx-auto mt-8 max-w-lg space-y-3">
        {FAQS.map((f) => (
          <details
            key={f.q}
            className="group rounded-2xl border-2 border-stone-800/90 bg-white open:shadow-hard-sm"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3.5 text-sm font-extrabold text-stone-800 [&::-webkit-details-marker]:hidden">
              {f.q}
              <span
                aria-hidden="true"
                className="shrink-0 text-lg font-black text-amber-500 transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="border-t-2 border-dashed border-stone-200 px-5 py-3.5 text-sm font-semibold leading-relaxed text-stone-500">
              {f.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
