/**
 * Client feature flags. `NEXT_PUBLIC_*` env vars are inlined at build time, so
 * each flag must reference the full literal name (no dynamic lookups).
 */

/**
 * Preferred-skills input for AI hybrid search. Off until the backend enables
 * hybrid matching (`aggregation.ai.enabled`); until then collecting skills has
 * no effect, so the input stays hidden. Turn on with
 * `NEXT_PUBLIC_ENABLE_SKILLS=true`.
 */
export const FEATURE_SKILLS = process.env.NEXT_PUBLIC_ENABLE_SKILLS === "true";
