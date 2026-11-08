# AGENTS.md

Guidance for AI agents and developers working in this repository. Read this together with [DESIGN.md](./DESIGN.md) — DESIGN.md owns *how the UI looks*, this file owns *how the code works*.

## What this is

**Bakery Delight** — a marketing + ordering site for a one-person home bakery. Visitors browse treats, read reviews and order over WhatsApp. The owner manages everything (treats, categories, gallery, reviews, messages, site settings) through a password-protected admin panel at `/admin`.

## Stack

| Layer      | Choice                                                        |
| ---------- | ------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack), React 19                   |
| Styling    | Tailwind CSS 4 (`@theme` tokens in `src/app/globals.css`)      |
| Fonts      | Self-hosted via `next/font/local`: Poppins (UI), Cormorant Garamond (display), Caveat (handwriting) |
| Icons      | `lucide-react` + bespoke SVGs in `src/components/icons.tsx`    |
| Data       | MongoDB via Mongoose (`src/models/`)                           |
| Images     | Cloudinary (uploads cropped client-side with `react-easy-crop`) |
| Auth       | JWT session cookie signed with `jose` (`src/lib/auth.ts`)      |

## Commands

```bash
pnpm dev        # dev server on :3000
pnpm build      # production build
pnpm start      # serve the production build
pnpm lint       # eslint
```

Environment lives in `.env.local` (Mongo URI, Cloudinary keys, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET`). Never commit it. Optional: `RESEND_API_KEY` + `NOTIFY_EMAIL` enable best-effort email alerts for new contact messages and pending reviews (`src/lib/notify.ts`); unset means the feature is off.

## Architecture

### Routes

- **Public pages** (`src/app/`): `/` (home), `/treats`, `/gallery`, `/about`, `/reviews`, `/contact`. All use `export const dynamic = "force-dynamic"` because content is DB-backed. Each has a `loading.tsx` skeleton that mirrors the page's exact layout — keep them in sync when you change a page's layout.
- **Admin** (`src/app/admin/`): `admin/layout.tsx` is a pass-through; the `(dashboard)` route group layout enforces auth and renders `AdminShell`. `/admin/login` sits outside the group.
- **API** (`src/app/api/`): public `treats`, `reviews`, `gallery`, `contact`, `images/[id]`; admin CRUD under `api/admin/*`; auth under `api/auth/*`.

### Data access

- `src/lib/site-data.ts` is the only way public pages read the DB. Every query goes through `withDB()` which falls back to `src/lib/seed.ts` content when MongoDB is unreachable — the site never hard-fails. Keep fallbacks plausible; they are what people see when the DB is down.
- Admin API routes (`api/admin/*`) call `requireAdmin()` from `src/lib/auth.ts` before touching data. Public API routes are read-only.

### Auth flow

`src/proxy.ts` (Next 16's middleware) matches `/admin/:path*`, verifies the session cookie with `jose`, and redirects to `/admin/login?next=…` when absent. Login POSTs to `/api/auth/login`, which checks `ADMIN_EMAIL`/`ADMIN_PASSWORD` env credentials and sets an httpOnly cookie. Logout clears it.

### Admin UI patterns

- `src/components/admin/AdminShell.tsx` exports `showToast(message, kind)` — a window-event toast bus. All manager feedback goes through it; don't invent inline success states.
- Managers (`TreatsManager`, `CategoriesManager`, `GalleryManager`, `MessagesManager`, `ReviewsManager`) each own their fetch/modals and share classes from `globals.css` (`.field-input`, `.field-label`, `.btn-primary`, `.btn-ghost`, `.btn-danger`, `.icon-btn`, `.admin-card`, `.skeleton`).
- `ImageUploader` crops to a fixed aspect with `react-easy-crop`, uploads to `/api/admin/upload`, and returns a Cloudinary URL.
- Loading placeholders: use the `.skeleton` class, not ad-hoc `animate-pulse` divs.
- Admin row skeletons live in `src/components/admin/Skeletons.tsx`; site ones in `src/components/site/Skeletons.tsx`.

## Conventions

- **Colors**: only the named tokens from `globals.css` (`@theme`): `cream-*`, `blush-*`, `berry*`, `cocoa*`, `ink`, `paper`, `gold*`, `wa*`, `success*`, `danger*`. No raw hex in components. Small berry text (< 24px) uses `berry-deep`, never `berry` (contrast).
- **Type sizes**: stick to the scale in DESIGN.md (11/12/13/14/15/16 UI; display via `font-display`). No one-off `text-[13.5px]`-style values.
- **Spacing**: 4px grid. Page gutters `px-5 → sm:px-10 → lg:px-[8.5rem]` on the public site.
- **Icons**: one stroke convention (1.8; 2 for tiny arrows). Site brand icons live in `icons.tsx`; admin imports lucide directly.
- **Copy**: no exclamation marks in interface text, no trailing periods on short strings, no unverified claims. Voice rules in DESIGN.md.
- **Motion**: `transition-colors` / `transition-shadow` / `transition-[border-color,box-shadow]` — never `transition-all`, never animated layout properties, no looping decoration. Skeletons and spinners are the only allowed loops.
- **File placement**: new public sections are `src/components/` server components when possible; interactivity goes into `src/components/site/*` client components. Keep `page.tsx` files thin (data + composition).

## Gotchas

- `page.tsx` searchParams in Next 16 are a Promise — `await` them.
- Admin pages are `force-dynamic` + middleware-guarded; don't try to statically prerender them.
- Cloudinary uploads require the crop flow — raw files larger than 12 MB are rejected client-side.
- `getFeaturedTreats` etc. sort by insertion order, not date — the admin "featured" toggle controls homepage placement.
- WhatsApp links are built from `settings.whatsappDigits` (country code + number, digits only). The display number is separate (`whatsappNumber`).
- Treat deletion is blocked server-side when treats still reference the category.

## Before you finish

1. `pnpm build` passes.
2. `pnpm lint` — the 7 pre-existing `react-hooks/set-state-in-effect` errors in the managers' `load()` patterns are known; don't add new ones.
3. Check mobile (375px), tablet (~820px) and desktop (1440px): no horizontal overflow, skeletons match layout, touch targets ≥ 40px, hover-revealed controls also work on touch (see GalleryManager's delete button for the pattern).
4. New UI follows DESIGN.md — if you need a new color, add a token, not a hex.
