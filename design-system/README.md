# RoleOwl design system (Claude Design bundle)

Local component library that pushes to a **claude.ai/design** design-system project via
the `DesignSync` flow. Each `.html` file is a self-contained preview card — it opens
standalone in a browser and is indexed in the Design System pane via its first-line
`<!-- @dsCard group="…" name="…" -->` marker.

See [`../DESIGN.md`](../DESIGN.md) for the written brief (metaphor, voice, guardrails).

## Cards

| Group | File | What it shows |
|---|---|---|
| Foundations | `foundations/colors.html` | Cream/amber/grape/teal palette, grape scale, night-hero colors |
| Foundations | `foundations/typography.html` | Bricolage display + Nunito body scale & weights |
| Foundations | `foundations/elevation.html` | Hard-offset sticker shadows, borders, radius |
| Components | `components/buttons.html` | Pressable buttons — variants, states, sizes |
| Components | `components/forms.html` | Inputs, tag-input chips, toggle, alerts |
| Components | `components/job-card.html` | Feed unit — meta chips, new/viewed stickers |
| Patterns | `patterns/night-hero.html` | The signature dark hero |
| Patterns | `patterns/empty-states.html` | Owl mascot states + voice |

`_shared.html` is a reusable `<head>` fragment (tokens/fonts) — not a card.

## Push to Claude Design

1. Authenticate: `/login` → "Claude account with subscription" (grants design scopes).
2. I run `DesignSync`: `list_projects` → `create_project` (or pick existing) →
   `finalize_plan` (writes `design-system/**`) → `write_files`.
3. Sync is incremental — components go one at a time, never a wholesale replace.
