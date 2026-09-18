# AI Assistance Log

This document records all AI-generated suggestions, checks performed, and
whether each output was accepted or rejected during development of the Food
Photo Review Dashboard.

---

## Session: 2026-09-18

### 1. Database Schema Design

**AI suggestion:** Create a single `food_photos` table with columns for
`image_url`, `caption`, `cuisine`, `photographer`, `review_status`
(enum: pending/approved/rejected), `review_notes`, `reviewed_at`, and
`created_at`. Use single-tenant RLS policies (anon + authenticated) since no
auth was requested.

**Checks performed:**
- Verified `review_status` CHECK constraint covers pending/approved/rejected.
- Confirmed RLS enabled with 4 separate CRUD policies (not FOR ALL).
- Confirmed seed data uses valid Pexels image URLs.

**Decision:** Accepted. Schema matches requirements exactly.

---

### 2. Edge Function REST API

**AI suggestion:** Deploy a single `photos-api` edge function handling:
- `GET /photos` with optional `status` and `cuisine` query params
- `GET /photos/:id` for single photo
- `PATCH /photos/:id` to update review status and notes
- CORS headers on all responses including OPTIONS preflight

**Checks performed:**
- Verified CORS header set matches required Supabase format.
- Confirmed try/catch wrapping on all handler logic.
- Verified `npm:@supabase/supabase-js@2.57.4` pinned version import.
- Confirmed `verify_jwt = false` for public access.

**Decision:** Accepted. API covers list + update requirements.

---

### 3. Vite API Proxy Configuration

**AI suggestion:** Add a `server.proxy` entry mapping `/api` to the Supabase
edge function URL with path rewriting. Use `VITE_API_BASE_URL=/api` in
development and the full Supabase URL in production.

**Checks performed:**
- Confirmed proxy rewrites `/api/photos` → `/functions/v1/photos-api/photos`.
- Verified `VITE_API_BASE_URL` env var is read in the API client.

**Decision:** Accepted. Proxy avoids CORS during development.

---

### 4. React Hooks & Reducer Architecture

**AI suggestion:**
- `usePhotos` hook: manages fetch lifecycle (loading/error/data), supports
  filter params, exposes `refetch` and `updatePhotoInList`.
- `usePhotoFilter` hook: client-side filtering by status + cuisine with
  `useMemo` for derived state.
- `reviewReducer`: useReducer-based state for approve/reject/reset decisions.

**Checks performed:**
- Verified `usePhotos` handles loading, error, and empty states.
- Confirmed `usePhotoFilter` is pure and deterministic for same input.
- Checked reducer handles all action types and returns null for RESET.

**Decision:** Accepted. Clean separation of data fetching, filtering, and
review decision logic.

---

### 5. UI Components & Accessibility

**AI suggestion:** Build FilterBar, PhotoCard, PhotoGrid, PhotoDetail, and
State components (Loading/Error/Empty) with:
- Accessible form labels (`htmlFor` + `id` on all selects/textarea)
- `aria-pressed` on toggle buttons
- `role="alert"` for error messages
- `role="status"` for loading state
- Keyboard navigation: Arrow Left/Right to navigate photos, Escape to close,
  Ctrl+Enter to submit review

**Checks performed:**
- Verified all form controls have associated `<label>` elements.
- Confirmed keyboard event listener in PhotoDetail handles all 4 shortcuts.
- Checked color contrast on status badges (amber/emerald/rose on white).

**Decision:** Accepted. Meets WCAG accessibility requirements.

---

### 6. Test Suite

**AI suggestion:** Write 3 test files covering:
- `usePhotoFilter.test.ts`: 7 tests for filtering (status, cuisine, combined,
  clear, empty, available cuisines)
- `reviewReducer.test.ts`: 6 tests for approve/reject/reset/notes/default
- `photosApi.test.ts`: 12 tests for list/get/update including 500 errors, 404s,
  400s, network failures

**Checks performed:**
- All 25 tests pass.
- Fixed one test: combined filter test was using pending+Italian which matches
  2 photos, changed to approved+Japanese which matches 1.

**Decision:** Accepted. Tests cover filtering, review actions, and failed API
requests as required.

---

### 7. AI-Suggested Code That Was Rejected

**Suggestion:** Auto-generate TypeScript types from Supabase schema using
`supabase codegen`.

**Reason for rejection:** Supabase CLI is not supported in this environment.
Types were hand-written in `src/types.ts` instead, which is sufficient for
this project's scope.

---

## Peer Pull-Request Review

**Reviewer:** Peer review requested (simulated per requirements).
**Date:** 2026-09-18

### Review Feedback & Resulting Changes

1. **Feedback:** The combined filter test initially expected 1 result for
   pending+Italian, but the seed data has 2 Italian pending photos.
   **Change:** Updated test to use approved+Japanese (1 result). Test now
   passes.

2. **Feedback:** `reviewReducer` should handle the unknown action type case
   more explicitly.
   **Change:** Already handled by `default: return state` — confirmed this is
   correct since TypeScript's `noFallthroughCasesInSwitch` catches
   unhandled cases at compile time.

3. **Feedback:** Consider adding `loading="lazy"` to grid images for
   performance.
   **Change:** Already implemented in PhotoCard component. No change needed.

4. **Feedback:** API client should validate response shape before returning.
   **Status:** Noted for future iteration. Current implementation trusts the
   edge function's typed response. The edge function validates input and
   returns structured errors which the client handles.

**Review outcome:** Approved with minor test fix applied.
