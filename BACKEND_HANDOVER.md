# Backend → Frontend Handover

Backend features that are **fully implemented and live** but have **no frontend
yet**. This document is the API contract only — **UI/UX design is the
frontend's call**. Where a decision affects data (field names, when to send
what), it's spelled out; where it's purely presentation, it's left open.

Backend repo: `Social-Threads` (branch `main`). Base URL comes from
`NEXT_PUBLIC_API_URL` (see `lib/api.ts`). All calls below are authenticated
Bearer-token requests — use the existing `apiFetch<T>()` wrapper, which already
handles the token, the 401→refresh retry, and the `ApiError` envelope.

Error shape (already modelled as `ApiError` in `lib/types.ts`):
```json
{ "timestamp": "...", "status": 400, "error": "...", "message": "...", "fieldErrors": { "field": "msg" } }
```
`apiFetch` throws `ApiRequestError` with `.status`, `.message`, `.fieldErrors` —
reuse that for inline validation and toasts.

---

## ⚠️ Read first: preferences save will WIPE skills

The backend preferences `upsert` sets **every** column from the request body
unconditionally, including the new `preferredSkills`:

```java
pref.setPreferredSkills(request.getPreferredSkills()); // null if omitted → column nulled
```

The current frontend `PreferencesRequest` (`lib/types.ts`) does **not** include
`preferredSkills`. That means **any preferences save from the current frontend
sends `preferredSkills: undefined`, which the backend stores as `null` and
wipes the user's skills** (and triggers a re-embed with weaker signal).

**Therefore item 3 (preferred skills) is not optional polish — it must ship
before, or together with, any other preferences-form change**, otherwise every
save silently clobbers skills. If you ship the report button (item 1) first,
that's fine — it doesn't touch preferences.

---

## 1. Job reporting — DONE

> **Status: shipped.** `ReportReason`/`JobReport` types, `reportJob()` in
> `lib/api.ts`, and a report button + reason-picker modal
> (`components/ReportJobButton.tsx`) on matched-feed cards (card and list
> modes). Reporting is a two-step confirm; on success the card is dropped
> locally and an 8-second undo toast appears, backed by a new backend
> `DELETE /api/jobs/{id}/report` (idempotent un-report). Settings has a
> collapsed "Reported jobs" list backed by `GET /api/jobs/reports/mine`
> (own reports + job context), with per-row Restore. Admin counts endpoint
> not built (no admin view yet).

Lets a user flag a job that shouldn't be in their feed. Backend shipped in PR #3.

### Endpoints

**`POST /api/jobs/{id}/report`** — report a job (any authenticated user).

- Path param `id`: the job UUID (this is `Job.id` from the feed).
- Request body:
  ```ts
  { reason: ReportReason; details?: string } // details ≤ 500 chars
  ```
- `ReportReason` (exact enum values — send the string as-is):
  | value | meaning |
  |---|---|
  | `MISSING_EXPERIENCE` | posting has a YoE requirement the app failed to detect |
  | `WRONG_EXPERIENCE` | app shows the wrong YoE for the job |
  | `WRONG_LOCATION` | location doesn't match |
  | `EXPIRED` | job no longer open |
  | `SPAM` | spam / not a real job |
  | `OTHER` | free-text in `details` |
- Response `200`: the created/existing `JobReport`
  ```ts
  { id: string; userId: string; companyJobsId: string; reason: ReportReason; details: string | null; createdAt: string }
  ```
- Semantics:
  - **Idempotent per (user, job)** — reporting the same job twice returns the
    first report unchanged (no error).
  - The reported job is **removed from that user's matched feed immediately**
    on the next fetch (both the deterministic and hybrid matching paths exclude
    it). It is *not* removed for other users.
  - `404` (`ResourceNotFoundException`) if the job id is unknown.

**`GET /api/jobs/reports`** — **ADMIN authority only** (gated in
`SecurityConfiguration`; a normal user gets 403). Report counts for triage:
```ts
Array<{ reason: ReportReason; count: number }>
```
Only build this if/when you do an admin view — skippable for the user-facing MVP.

### Frontend work
- Add `ReportReason` to `lib/types.ts` and a `JobReport` type.
- Add `reportJob(id, body)` to `lib/api.ts` (`apiFetch` POST).
- Add a report affordance to job cards in the matched feed (`app/jobs`) — reason
  picker + optional details. On success, drop the card or refetch the page.
- **UI is your call**: modal vs inline, which reasons to surface first, whether
  to also expose it in the browse tab.

---

## 2. Account deletion (GDPR) — DONE

> **Status: shipped.** `deleteAccount()` in `lib/api.ts`; "Danger zone"
> section in `app/settings` with a password-confirm modal. On success:
> `clearTokens()` + redirect to `/`.

Permanent self-service account deletion. Backend endpoint is new (this branch).

### Endpoint
**`DELETE /api/profile`** — deletes the current user's account.
- Request body (password re-confirmation, required):
  ```ts
  { password: string }
  ```
- Response `204 No Content` on success.
- Wrong/blank password → error envelope (surface `ApiRequestError.message`;
  blank is a `400` field error on `password`).
- Deletion is permanent and cascades the user's rows.

### Frontend work
- Add `deleteAccount(password)` to `lib/api.ts` (note: `apiFetch` supports a
  body on DELETE via `options.body`).
- Add a "danger zone" action in `app/settings` — collect the password, confirm
  intent.
- **On success: call `clearTokens()` and redirect** (landing or `/login`).
- **UI is your call**: confirm dialog, typed confirmation, etc.

---

## 3. Preferred skills (enables hybrid search signal) — DONE, flag-gated

> **Status: implemented behind `NEXT_PUBLIC_ENABLE_SKILLS`** (default off).
> The types, the round-trip-safe payload, and a gated skills `TagInput` in
> `PreferencesForm` are in place. The input stays hidden until the flag is set
> to `true`, which should happen only once the backend enables hybrid search
> (`aggregation.ai.enabled`). Because the field is always sent (seeded from the
> stored value), saves never null skills whether the flag is on or off. See
> `lib/flags.ts`. The rest of this section is kept for reference.


The preferences endpoints already exist; a new **`preferredSkills`** field was
added to both the request and the response. It feeds the user's profile
embedding used by AI hybrid matching. (Hybrid matching itself needs **no**
frontend change — `/api/jobs/matched` is unchanged; it just uses a richer user
signal when skills are present and AI is enabled server-side.)

### Contract changes (existing endpoints)
- **`GET /api/preferences`** response now includes `preferredSkills: string[] | null`.
- **`POST /api/preferences`** and **`PUT /api/preferences`** request bodies now
  accept `preferredSkills: string[]` (optional; omitting it stores `null` —
  see the ⚠️ warning above).
- The embedding column is **not** serialized — you won't see it in responses.

### Frontend work
- Add `preferredSkills: string[] | null` to `Preferences` and
  `preferredSkills: string[]` to `PreferencesRequest` in `lib/types.ts`.
- **Include `preferredSkills` in every preferences save payload** (onboarding
  wizard submit + settings preferences form), defaulting to the current value
  (or `[]`), so saves never wipe it.
- Add a skills input to the onboarding wizard and settings.
- **UI is your call**: free-text tag input, suggested chips, etc. Backend takes
  an arbitrary list of strings — no fixed vocabulary.

---

## 4. Required type fix: `yoeSource` gained a value — DONE

> **Status: shipped.** Union member added in `lib/types.ts`. `LLM_EXTRACTED`
> renders like `EXTRACTED` ("N+ yrs"); only `TITLE_INFERRED` gets the
> "~ (from title)" hedge.

Independent of the above, the backend `YoeSource` enum now has **three** values,
but `lib/types.ts` `Job.yoeSource` only lists two:

```ts
// current (stale):
yoeSource: "EXTRACTED" | "TITLE_INFERRED" | null;
// should be:
yoeSource: "EXTRACTED" | "LLM_EXTRACTED" | "TITLE_INFERRED" | null;
```

`LLM_EXTRACTED` = the LLM read a YoE out of the posting when the regex found
nothing. Trust/ranking order is `EXTRACTED` > `LLM_EXTRACTED` > `TITLE_INFERRED`.
Decide how (or whether) to show `LLM_EXTRACTED` in the provenance badge — but
add the union member so it isn't mislabelled/undefined.

---

## Not available from the backend (don't build against these)

- **Job `skills` on the feed**: `company_jobs` stores extracted `skills`, but
  `JobResponse` (`GET /api/jobs`, `/api/jobs/matched`) does **not** expose them.
  If you want to render per-job skill chips, that needs a backend change first —
  raise it and it's a small `JobResponse` addition.
- **Hybrid search is server-side and flag-gated** (`aggregation.ai.enabled`,
  currently off in prod). No frontend toggle exists or is needed; matched
  results come from the same `/api/jobs/matched` endpoint regardless.

---

## Suggested order

1. **Preferred skills (item 3) + the `yoeSource` type fix (item 4)** — do these
   first/together so preferences saves stop nulling skills.
2. **Job reporting (item 1)** — self-contained, highest user value.
3. **Account deletion (item 2)** — compliance; low complexity.
