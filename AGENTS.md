<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# JobSwipe Web

Next.js 16 (App Router) + Tailwind v4 + TypeScript frontend for the JobSwipe backend
(Spring Boot, sibling repo `../Social-Threads`, runs on port 4196).

## Commands

```bash
npm run dev     # dev server on :3000
npm run build   # production build (also the CI check)
npm run lint
```

Backend must be running for anything useful: `SPRING_PROFILES_ACTIVE=local ./gradlew bootRun`
in `../Social-Threads` (plus `docker-compose up -d` there for Postgres + Mailpit).

## Configuration

- `NEXT_PUBLIC_API_URL` (`.env.local`, default `http://localhost:4196`) — backend base URL.
- Backend CORS already allows `http://localhost:3000`.

## Architecture

- **Auth**: access JWT + rotating refresh token from `/api/auth/authenticate|register`,
  both in localStorage (`lib/api.ts`). `AuthProvider` (`lib/auth.tsx`) exposes `useAuth()`.
  Route protection is client-side via `components/RequireAuth.tsx` — middleware can't see
  localStorage. `apiFetch` auto-attaches the Bearer token, and on 401 transparently calls
  `/api/auth/refresh` once (deduplicated across concurrent calls) and retries; only if the
  refresh fails does it clear tokens and redirect to `/login?expired=1`. Logout revokes
  the refresh token server-side (best-effort).
- **Pages** (`app/`): `/` landing (redirects to /jobs when logged in), `/login`,
  `/register` (→ `/onboarding`), `/forgot-password`, `/reset-password` (target of backend
  reset emails — do not move without updating `app.frontend-url` in the backend),
  `/onboarding` (preferences wizard), `/jobs` (For-you + Browse-all tabs, pagination),
  `/settings` (profile, preferences, digest toggle).
- **Shared bits**: `components/ui.tsx` (Input/Button/Alert/TagInput/Toggle/Spinner),
  `components/PreferencesForm.tsx` (used by onboarding and settings),
  `components/JobCard.tsx`, `lib/types.ts` (mirrors backend DTOs).

## Gotchas

- `useSearchParams` pages (`/login`, `/reset-password`) need a `<Suspense>` wrapper or
  the production build fails.
- The matched-jobs endpoint returns 404 when the user has no preferences — `/jobs`
  treats that as "show the set-preferences CTA", not an error.
- Preference titles/locations are matched by substring in the backend; the suggestion
  chips in `PreferencesForm` mirror the backend's configured roles/locations.

## E2E smoke

No test framework wired in yet. A Playwright smoke script (register → onboarding →
feed → settings → logout → reset-password-via-Mailpit) was used during development:
launch both servers, then drive with Playwright using `channel: "msedge"` (no browser
download needed on Windows).
