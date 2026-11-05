# DESIGN.md

The design system for Bakery Delight. Written after a full unslop pass (based on the [unslop](https://github.com/heydamir) method by @heydamir) — every rule here exists because its absence produced slop. New screens must follow this file; when a rule blocks you, extend the system here first, then build.

## Direction

- **Product.** A one-person home bakery site where neighbours browse treats and order cakes over WhatsApp.
- **Character.** Warm, handmade, unhurried.
- **World.** A home kitchen at golden hour — butter, jam, flour dust, handwritten recipe cards, brown paper.
- **Moments.** The hero photograph with its handwritten margin notes; the taped polaroid collages; the dark-cocoa CTA band. Admin keeps one rich moment: the cocoa status panel. Everything else stays quiet so these read instantly.
- **Signature.** The Caveat handwritten margin note — slightly rotated, with a small heart — used for section eyebrows and end-of-list notes, plus the hand-drawn branch SVG peeking from page edges. If a screen doesn't need the signature, don't force it; never use more than two handwritten elements per screen.

## Color

Defined once in `src/app/globals.css` under `@theme`. Never use raw hex in components.

| Token | Value | Use |
| --- | --- | --- |
| `cream-50` | `#fff8f3` | Inner-page background |
| `cream-100` | `#fdf2ec` | Brand page background, nav strips, waves |
| `cream-200` | `#f6efe9` | Deeper wash, admin canvas |
| `cream-300` | `#f0dfd4` | Default hairline borders |
| `cream-400` | `#e0cabd` | Strong borders, empty star fills, disabled |
| `blush-100` / `blush-200` | `#fceff0` / `#f8e2e3` | The two pink section bands (About, Custom Cakes) |
| `berry` | `#cc4751` | The accent: buttons, active states, display accent ≥ 24px. White text on it passes 4.5:1 |
| `berry-deep` | `#b03a44` | Hover, links, **all berry text under 24px** |
| `berry-soft` | `#fbe9ea` | Tint fills, icon chips, avatar rings |
| `berry-ink` | `#7a2f35` | Handwritten notes, dark berry text |
| `ink` | `#1c0906` | Primary text on light surfaces |
| `cocoa` / `cocoa-2` | `#2b160e` / `#4a2a1a` | Dark surfaces: CTA band, admin sidebar, login panel |
| `paper` | `#f0e6d2` | Taped note tags in photo collages |
| `gold` / `gold-ink` / `gold-soft` | `#f5a623` / `#8a5c02` / `#faf1d3` | Ratings and "featured" only — never decoration |
| `wa` / `wa-soft` | `#075e54` / `#e8f7ee` | WhatsApp meaning only (order links, contact card). Dark shade passes contrast — the old `#25D366`-with-white-text card did not |
| `success` / `success-soft` | `#1a7f4b` / `#e8f7ee` | Approval states |
| `danger` / `danger-soft` | `#9c333d` / `#fdecec` | Destructive actions, error text/backgrounds |

Rules:

- Three text roles only: primary `ink`, secondary `stone-600`, muted `stone-500`. `stone-400` is reserved for placeholders and decorative glyphs — never for real copy.
- One accent (berry). It marks the primary action, the active item, or the one number that matters — not all three at once.
- Semantic color carries meaning: gold = rating/featured, `wa` = WhatsApp, green = approved, red = destructive/delete.
- Borders are quiet hairlines (`cream-300`); shadows are neutral and small. No colored glow shadows anywhere.
- Depth on dark surfaces comes from surface steps, not shadows.

## Type

Self-hosted in `src/app/layout.tsx`:

- **Poppins** 400/500/600 — interface and body.
- **Cormorant Garamond** 700 — display headlines (`.font-display`). Only at large sizes (28px+).
- **Caveat** 600/700 — handwriting (`.font-hand`, `.eyebrow-hand`).

Scale: 11 · 12 · 13 · 14 · 15 · 16 · 18 UI text; 22/24/28/40/44/56/64 display. No one-off values like 13.5px.

- Weights 400/500 for UI, 600 rarely for emphasis; hierarchy comes from size and color, not weight.
- Sentence case everywhere. **No uppercase tracked labels** — section eyebrows are Caveat (`eyebrow-hand`), not tracked Poppins caps.
- Numbers that count things use `tabular-nums` and one format per screen.
- No italic emphasis, no gradient text.

## Spacing & layout

- 4px grid everywhere; same things get the same size. Density: page edges 24–32, cards 20–24, compact controls 16.
- Public page gutters: `px-5 → sm:px-10 → lg:px-[8.5rem]` (136px). Section rhythm: 64–96px vertical.
- Admin: sidebar 264px (84px collapsed), content max none, rows 36–40px tall with 4px gaps.
- Hero: photo edge-to-edge, headline upper-left, one primary + one secondary action. On phones the wave + baked note close the composition; no scroll indicators.
- Cards in a row share width but the page's grid keeps rhythm: compact stats above wide panels, wide chart-like blocks beside narrow lists.

## Radius

Nested radii add up (inner = outer − padding): controls 8–10 (`rounded-lg/xl`), cards 12–16 (`rounded-2xl`), buttons/keep-chips `rounded-full`. Admin toggles and inputs are `rounded-xl`, never pills.

## Icons

- Lucide for UI, one set, stroke 1.8 (2 for tiny directional arrows). Sizes: 16/18px inline, 20–30px feature icons.
- Icons take their text role's color; they never get their own hue.
- No emoji in the interface. Ratings are lucide `Star` with `gold` fill — never `★` glyphs.
- Brand marks (Instagram, WhatsApp, Pinterest, Facebook, YouTube) and the bespoke cupcake live in `src/components/icons.tsx` and stay hand-tuned.

## Motion

- One easing (default `ease-out`), short durations: 150–200ms hovers, 200–300ms panels/menus.
- Hover = color, border or shadow change; press = tiny scale down; menus fade and rise 4px (`animate-[menu-in_180ms_ease-out]`).
- The full-screen nav (phones/tablets, `site/FullscreenMenu.tsx`) is the one sanctioned long-form motion: a `clip-path` circle wipe (~480ms) from the menu button plus staggered opacity/transform steps. `clip-path` joins the named transitions for this component only — no loops, no layout properties, `prefers-reduced-motion` collapses it.
- Named transitions only: `transition-colors`, `transition-shadow`, `transition-[border-color,box-shadow]`, `transition-[opacity,transform]`. **Never** `transition-all`, never animate width/height/margin/gap.
- No looping decoration: no `animate-bounce`, no SMIL `<animate>`, no hover lifts or `hover:scale` on cards, no image zooms. The only allowed loops are `animate-pulse` (skeletons) and `animate-spin` (spinners).
- Every interactive element has a visible keyboard focus ring (global `:focus-visible` outline in `globals.css`).

## Components

Shared classes in `globals.css` `@layer components`: `.field-label`, `.field-input`, `.field-error`, `.btn-primary`, `.btn-ghost`, `.btn-danger`, `.icon-btn`, `.admin-card`, `.skeleton`, plus `.font-display`, `.font-hand`, `.eyebrow-hand`.

Patterns worth copying:

- **Section heading** — display headline + thin `cream-400` rule, quiet link on the right whose arrow slides on hover.
- **Card hover** — shadow deepens only (`hover:shadow-md`), never lifts; the card's arrow chip fills with berry.
- **Status pills** — quiet 11px semibold on soft tint (`Live`, `Pending`, `New`); unread count is the one berry number on the admin dashboard.
- **Admin touch safety** — hover-revealed controls must be visible on touch: `opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100` (see GalleryManager delete).
- **Empty states** — icon chip, display heading, one sentence, one action. Written in the bakery's voice ("New bakes are always in the oven").
- **Loading** — `.skeleton` blocks mirroring exact layout; every page's `loading.tsx` matches its content layout so nothing jumps.

## Voice

- Say what it is, plainly, in the bakery's voice: "Fresh from the oven", "Every review here comes from a real order".
- No exclamation marks. No trailing periods on headlines, labels or buttons. No greeting headlines — name the context (the date, the page) instead.
- No hype words, no unverified claims. The About-page figures (500+ customers, 50+ creations) were confirmed real by the owner — keep them only there, where they read as the bakery's own story.
- Mock/placeholder content must look real (real names, plausible prices like ₹699) — never `123` or `Test`.
- A change states its comparison ("N treats", "N reviews") — no bare decorations.

## Responsive rules

- **Mobile (≤ 640)**: everything stacks in reading order; the hero switches to the portrait photo + drawn wave + handwritten note; nav collapses to the menu button; grids drop to 1–2 columns; dense previews simplify instead of shrinking; nothing below 11px.
- **Tablet (641–1023)**: 2–3 column grids, hero keeps the desktop photo with the left scrim, menu button still visible (nav links appear at `lg`).
- **Desktop (≥ 1024)**: full nav, 4–5 column grids, admin sidebar with collapse toggle (instant, not animated).
- Never horizontal overflow at any width; touch targets ≥ 40px; hover-only affordances always have a touch-reachable equivalent.

## Do not

- Do not reintroduce glassmorphism, gradient surfaces, colored glows, floating blobs or bento trends.
- Do not add a second accent color or a second handwriting context per screen.
- Do not fake data (badges, cart counts, avatars, stars from nowhere).
- Do not swap Poppins/Cormorant/Caveat for trendy faces; they are the brand.
- Do not change section order or invent features — this system polishes the product it has.
