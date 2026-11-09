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
pnpm test:e2e   # Playwright suite against a throwaway DB on :3100
```

Start from `.env.example`: copy it to `.env.local` and fill in real values. Never commit `.env.local`. Optional: `RESEND_API_KEY` + `NOTIFY_EMAIL` enable best-effort email alerts for new contact messages and pending reviews (`src/lib/notify.ts`); unset means the feature is off.

## Testing

The Playwright suite in `e2e/` is the main safety net — run `pnpm test:e2e` before finishing any behavior change.

- **Specs mirror the app**: `e2e/public/*` (every public page, including `seo.spec.ts`), `e2e/admin/*` (auth + every manager), `e2e/api/*`, and `e2e/flows/public-to-admin.spec.ts`. When you add a page or admin section, add a matching spec.
- **Isolation**: tests run against the `bakerydelight_test` database on the same Mongo server as `.env.local` — the owner's real content is never touched. Cloudinary vars are blanked so uploads fall back to DB storage (`src/lib/storage.ts`). Never point the suite at another database.
- **Credentials** come from `.env.local` via `e2e/support/env.ts`, so the suite needs a real `.env.local` and a reachable MongoDB, just like `pnpm dev`. First run also needs `pnpm exec playwright install chromium`.
- **Sequential by design**: `workers: 1` because specs share the test database. Don't parallelize without changing that.
- **The suite enforces the SEO rules** (registry copy lengths, canonical tags, JSON-LD) from the SEO section — update `src/lib/site-pages.ts` and `e2e/public/seo.spec.ts` together.

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

A component reads like the left, never the right:

```tsx
// Good — tokens, one transition property, no trailing period
<Link href="/treats" className="rounded-full bg-berry px-7 py-3.5 font-medium text-white transition-colors hover:bg-berry-deep">
  Explore Treats
</Link>

// Bad — raw hex, transition-all, trailing period, unstyled anchor
<a href="/treats" className="rounded-full px-7 py-3.5 text-white transition-all hover:bg-[#9d2f5f]">
  Explore Treats.
</a>
```

## Boundaries

- ✅ **Always**: finish with `pnpm build`, `pnpm lint` and `pnpm test:e2e`; read DESIGN.md before touching UI; keep every public page's `loading.tsx` in sync with its layout; use `absoluteUrl()` for any absolute link.
- ⚠️ **Ask first**: schema changes in `src/models/`, new dependencies, edits to `src/lib/auth.ts`, `src/proxy.ts` or `playwright.config.ts` (auth, DB isolation and the GPU workaround are deliberate), and changes to the seed content people see when the DB is down.
- 🚫 **Never**: commit `.env.local` or real credentials; hardcode a domain; use raw hex or `transition-all` in components; remove the robots/noindex protection on `/admin` and `/api`; delete or skip a failing e2e test you can't fix.

## SEO

The checklists come from the skill at `.agent/skills/nextjs-seo-audit/SKILL.md` (run it whenever touching meta tags, headings or page structure). The rules below make compliance nearly automatic:

- **`NEXT_PUBLIC_SITE_URL` in `.env.local` is the single source of truth** for the site's public URL. Canonical tags, Open Graph URLs and `sitemap.xml` all derive from it via `src/lib/site-url.ts` (`absoluteUrl()`). Never hardcode a domain anywhere.
- **Every public page takes its metadata from the registry** in `src/lib/site-pages.ts` via `export const metadata = pageMetadata(SITE_PAGES.<key>)`. The registry entry supplies the title, description (120–160 chars), canonical, Open Graph and Twitter tags, and a `sitemap.xml` entry — one edit covers everything.
- **When you create a public page**: add a `SITE_PAGES` entry (title segment renders as `<title> — Bakery Delight`, keep the result 30–60 chars; description 120–160), then use `pageMetadata()`. When you edit a page's copy, update its registry entry to match.
- **Dynamic routes** (like `treats/[slug]`) use `generateMetadata()` with the same fields — copy the pattern from `src/app/(site)/treats/[slug]/page.tsx` — and need their URLs added to `src/app/sitemap.ts` explicitly (static pages come from the registry automatically).
- **Structured data** builders live in `src/lib/schema.ts`. Add only schemas relevant to the page type: `bakerySchema` on pages with contact signals (home, contact), `productSchema` + `breadcrumbSchema` on treat detail. Render with `<script type="application/ld+json">`.
- **Keep `/admin` and `/api` out of search**: robots.ts disallows them and the admin layouts set `robots: { index: false }`. Don't remove either; new admin sections inherit the layout's noindex.
- `og-default.jpg` (1200×630) is the fallback share image; pages may override it in their metadata.

## Gotchas

- `page.tsx` searchParams in Next 16 are a Promise — `await` them.
- Admin pages are `force-dynamic` + middleware-guarded; don't try to statically prerender them.
- Cloudinary uploads require the crop flow — raw files larger than 12 MB are rejected client-side.
- `getFeaturedTreats` etc. sort by insertion order, not date — the admin "featured" toggle controls homepage placement.
- WhatsApp links are built from `settings.whatsappDigits` (country code + number, digits only). The display number is separate (`whatsappNumber`).
- Treat deletion is blocked server-side when treats still reference the category.

## Before you finish

1. `pnpm build` passes.
2. `pnpm lint` — the 7 pre-existing `react-hooks/set-state-in-effect` errors in the managers' `load()` patterns are known; don't add new ones. Zero warnings is the bar.
3. `pnpm test:e2e` passes (needs `.env.local` and a reachable MongoDB; see Testing).
4. Check mobile (375px), tablet (~820px) and desktop (1440px): no horizontal overflow, skeletons match layout, touch targets ≥ 40px, hover-revealed controls also work on touch (see GalleryManager's delete button for the pattern).
5. New UI follows DESIGN.md — if you need a new color, add a token, not a hex.
