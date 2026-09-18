# Food Photo Review Dashboard

A responsive web application for reviewing and moderating submitted food
photographs. Reviewers can browse a photo grid, filter by review status and
cuisine, and approve or reject individual photos with optional notes.

## Features

- **Responsive photo grid** — adapts from 1 column on mobile to 3 columns on
  desktop, with a sticky detail panel on large screens.
- **Filter bar** — filter by review status (pending / approved / rejected /
  all) and cuisine, with active filter count and clear-all.
- **Review detail panel** — large image preview, photo metadata, approve /
  reject buttons, notes textarea, and submit with loading/error states.
- **Keyboard navigation** — Arrow Left/Right to navigate between photos,
  Escape to close the detail panel, Ctrl+Enter to submit the current review.
- **Accessible forms** — all inputs have associated `<label>` elements,
  toggle buttons use `aria-pressed`, errors use `role="alert"`, loading uses
  `role="status"`.
- **Loading, empty, and error states** — skeleton loaders during fetch,
  empty state when no photos match filters, error state with retry button.
- **Typed REST API client** — fully typed requests and responses with
  structured error handling.

## Tech Stack

- **React 18** with TypeScript
- **Vite 5** with API proxy
- **Tailwind CSS 3** for styling
- **Lucide React** for icons
- **Supabase** (Postgres + Edge Functions) for backend
- **Vitest + Testing Library** for tests

## Setup

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment Variables

The following are pre-configured in `.env`:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |
| `VITE_API_BASE_URL` | API base URL (uses Vite proxy `/api` in dev) |

### Running the Development Server

```bash
npm run dev
```

The Vite dev server proxies `/api/*` requests to the Supabase Edge Function,
avoiding CORS issues during development.

### Building for Production

```bash
npm run build
```

Output is in `dist/`. Set `VITE_API_BASE_URL` to the full Supabase Edge
Function URL for production deployments.

### Running Tests

```bash
npm test          # run once
npm run test:watch # watch mode
```

### Type Checking

```bash
npm run typecheck
```

## Component Structure

```
src/
├── api/
│   └── photosApi.ts          # Typed REST client (list, get, updateReview)
├── components/
│   ├── FilterBar.tsx         # Status + cuisine filter dropdowns
│   ├── PhotoCard.tsx         # Single photo card in the grid
│   ├── PhotoDetail.tsx       # Detail panel with review form + keyboard nav
│   ├── PhotoGrid.tsx         # Responsive grid of PhotoCards
│   ├── States.tsx            # Loading, Error, Empty state components
│   └── StatusBadge.tsx       # Colored status pill (pending/approved/rejected)
├── hooks/
│   ├── usePhotos.ts          # Data fetching hook (loading/error/refetch)
│   ├── usePhotoFilter.ts     # Client-side filtering by status + cuisine
│   └── reviewReducer.ts      # Reducer for approve/reject/reset decisions
├── test/
│   ├── setup.ts              # Vitest + jest-dom setup
│   ├── usePhotoFilter.test.ts # 7 tests for filtering
│   ├── reviewReducer.test.ts  # 6 tests for review actions
│   └── photosApi.test.ts      # 12 tests for API client (incl. failures)
├── types.ts                  # Shared TypeScript types
├── App.tsx                   # Main app: layout, state, wiring
├── main.tsx                  # React entry point
└── index.css                 # Tailwind directives
```

## API Contracts

The backend is a Supabase Edge Function deployed at
`/functions/v1/photos-api`.

### GET /photos

List food photos with optional filtering.

**Query Parameters:**

| Param | Type | Values | Required |
|---|---|---|---|
| `status` | string | `pending`, `approved`, `rejected` | No |
| `cuisine` | string | Any cuisine name (case-insensitive) | No |

**Response (200):**

```json
[
  {
    "id": "uuid",
    "image_url": "https://...",
    "caption": "Heirloom vegetable plate",
    "cuisine": "French",
    "photographer": "Rene Terp",
    "review_status": "pending",
    "review_notes": null,
    "reviewed_at": null,
    "created_at": "2026-09-10T09:30:00Z"
  }
]
```

**Error (500):** `{ "error": "Failed to fetch photos" }`

### GET /photos/:id

Get a single photo by ID.

**Response (200):** Single photo object (same shape as list items).

**Error (404):** `{ "error": "Photo not found" }`

### PATCH /photos/:id

Update a photo's review status and notes.

**Request Body:**

```json
{
  "review_status": "approved",
  "review_notes": "Excellent composition"
}
```

| Field | Type | Values | Required |
|---|---|---|---|
| `review_status` | string | `pending`, `approved`, `rejected` | Yes |
| `review_notes` | string \| null | Reviewer notes | No |

**Response (200):** Updated photo object with `reviewed_at` timestamp set.

**Errors:**
- `400`: `{ "error": "Missing or invalid review_status" }`
- `404`: `{ "error": "Photo not found" }`
- `500`: `{ "error": "Failed to update photo" }`

### CORS

All responses include:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Client-Info, Apikey
```

## Database Schema

### food_photos table

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `image_url` | text | NOT NULL |
| `caption` | text | NOT NULL |
| `cuisine` | text | NOT NULL |
| `photographer` | text | NOT NULL |
| `review_status` | text | NOT NULL, default `'pending'`, CHECK in (pending, approved, rejected) |
| `review_notes` | text | nullable |
| `reviewed_at` | timestamptz | nullable |
| `created_at` | timestamptz | NOT NULL, default `now()` |

**RLS:** Enabled with anon + authenticated CRUD policies (single-tenant, no
auth). Indexes on `review_status` and `cuisine`.

## Vite Configuration

The dev server includes an API proxy that forwards `/api` to the Supabase
Edge Function URL:

```
/api/photos  →  https://<project>.supabase.co/functions/v1/photos-api/photos
```

This avoids CORS issues during development. In production, set
`VITE_API_BASE_URL` to the full edge function URL.

## Testing

The test suite covers three areas as required:

1. **Filtering** (`usePhotoFilter.test.ts`) — status filter, cuisine filter,
   combined filters, clear filters, empty input, available cuisines list.
2. **Review actions** (`reviewReducer.test.ts`) — approve, reject, reset,
   default notes, state transitions.
3. **Failed API requests** (`photosApi.test.ts`) — 500 errors, 404s, 400
   validation errors, network failures, and success paths for list/get/update.

Run all tests: `npm test`

## Peer Review

A peer pull-request review was sought and documented in
[`AI_ASSISTANCE_LOG.md`](./AI_ASSISTANCE_LOG.md), including the feedback
received and resulting changes applied.
