# RoleOwl — Design Brief

A reference for anyone designing (or redesigning) RoleOwl surfaces. It captures the
product, the brand metaphor, and the visual/voice system so new work stays coherent.

## What it is

A **job-discovery tool** that reads company hiring systems (ATS platforms —
Greenhouse, Lever, Recruitee, Personio) *directly*, so roles surface here often a
full day before they reach the big job boards. It personalizes matches to a user's
preferences and sends a **daily morning email digest**. Global audience.

Next.js frontend (roleowl.org) on a Spring Boot backend.

## The core metaphor (this drives everything)

**"The owl hunts while you sleep."** The product works overnight — reading boards,
matching roles — and hands the user a fresh catch each morning. A wise, nocturnal
owl doing the tedious hunting *for* you. Every design and copy decision should trace
back to this one idea.

## Who it's for & the emotional truth

Job seekers — often **stressed, time-pressured, and a little demoralized**. The hero
line is blunt: *"You don't have that kind of time."* So the vibe is **playful but
never flippant**. It should feel like a capable, friendly companion that quietly does
the grind — reassuring, not chaotic.

## The governing principle: "Balanced Quirk"

> **Loud & playful on the landing page. Calm & trustworthy inside the app.**

The pre-login landing can be expressive (mascot, marquee ticker, doodles, big type).
The working surfaces (`/jobs`, onboarding, settings, forms) stay **legible and
low-noise** — people use them under stress, so clarity wins over cleverness.

## Visual language

- **Canvas:** warm cream `#FFF8ED`, ink text `#292524`. The whole world is
  daylight/cream…
- **The one dark moment:** the landing **"night-shift hero"** — a deep purple night
  panel (`#262143 → #3B3364`) with twinkling stars, a crescent moon, a breathing owl
  on a branch, and a *dawn glow* rising at its bottom edge. It's the signature; the
  dark treatment is **reserved** for this (and maybe "owl is hunting" empty states).
  Don't spread it around.
- **Palette:** amber (primary / CTA), **grape / night-purple `#3B3364`** (secondary
  accent), teal (tertiary), stone (neutrals). No coral / lime / pink — rejected.
- **Type:** **Bricolage Grotesque** — chunky display face for headings & hero.
  **Nunito** for all body copy (rounded, warm, friendly).
- **The "sticker" motif:** chunky, tactile, **hard-offset drop shadows**
  (`4px 4px 0` solid ink), 2px ink borders, slightly-rotated cards, sticker-pop
  stats. Feels like physical stickers / pressable toys.
- **Buttons:** "pressable" — a thick bottom border (`border-b-4`) that *collapses* on
  tap, plus a hard-offset shadow that tightens as it presses in. They should feel
  physically clickable.
- **Mascot:** an owl (`components/OwlMascot.tsx`) with **happy / sleepy** variants
  used expressively — sleepy on empty states, waking to happy as an onboarding form
  fills in.
- **Texture & play:** subtle film-grain overlay, hand-drawn doodles (squiggles,
  sparkles ✦), a live job-ticker marquee.

### Design tokens (current)

| Token | Value | Use |
|---|---|---|
| Canvas | `#FFF8ED` | Page background (cream) |
| Ink | `#292524` | Body text |
| Amber | `amber-400` / `amber-600` border | Primary CTA |
| Grape | `#3B3364` (`grape-700`) | Secondary accent; night hero base |
| Night panel | `#262143 → #3B3364` | Hero gradient |
| Star / moon | `#FCD34D` / `#FDE68A` | Hero sky |
| Display font | Bricolage Grotesque (`--font-display`) | Headings, hero |
| Body font | Nunito (`--font-sans`) | Everything else |
| Hard shadow | `4px 4px 0` ink @ 0.9 | Cards, modals, stickers (`shadow-hard`) |
| Hard shadow sm | `3px 3px 0` | Buttons at rest (`shadow-hard-sm`) |
| Hard shadow xs | `1px 1px 0` | Buttons pressed (`shadow-hard-xs`) |

## Motion

Gentle and characterful, never frantic: `twinkle` stars, `owl-bob` breathing, `rise`
fade-ups (staggered on lists), `pop-in` chips, scroll reveals. **`prefers-reduced-motion`
is fully respected** (durations collapse to ~0).

## Tone of voice

Warm, witty, owl-themed, honest. Real examples in product:

- *"Tell the owl what to hunt"* (set preferences)
- *"The owl found nothing new for you — it hunts every night, check back tomorrow."*
- *"Even the owl came back empty-taloned for those filters."*
- Trust-forward: only verifiable claims, **no invented endorsements or fake company
  logos**.

## Guardrails for a designer

1. **Mobile-first (test at 360–390px).** Feed metadata wraps into chips — never
   truncate. Sky decorations on the hero collide with centered headlines on mobile;
   keep them desktop-only or corner-tucked.
2. **Keep the cream / day world for app pages;** hold the night-purple for the hero.
3. **The owl and the night-hero are pinned** — restyle, don't replace.
4. **Legibility beats chaos** on `/jobs` and forms — used under pressure.

## One-line summary for the moodboard

*A wise night-owl that job-hunts while you sleep — warm cream daylight, one magic
purple night, chunky pressable sticker-UI, playful owl wit, but calm and trustworthy
the moment you get to work.*
