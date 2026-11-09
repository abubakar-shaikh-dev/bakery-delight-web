# Bakery Delight

A marketing + ordering site for a one-person home bakery. Visitors browse treats, read reviews and order over WhatsApp; the owner manages all content through a password-protected admin panel at `/admin`.

Built with Next.js 16 (App Router), React 19, Tailwind CSS 4, MongoDB via Mongoose, Cloudinary image uploads and JWT session auth.

## Getting started

Requires Node 20.9+ and [pnpm](https://pnpm.io).

```bash
pnpm install
cp .env.example .env.local   # then fill in your values
pnpm dev                     # http://localhost:3000
```

`.env.example` documents every variable — MongoDB connection, admin credentials, the JWT secret, Cloudinary keys and the public site URL. Nothing works without `.env.local`; if MongoDB is unreachable the public site falls back to bundled seed content instead of erroring.

## Scripts

| Command           | What it does                                        |
| ----------------- | --------------------------------------------------- |
| `pnpm dev`        | Dev server on :3000                                 |
| `pnpm build`      | Production build                                    |
| `pnpm start`      | Serve the production build                          |
| `pnpm lint`       | ESLint                                              |
| `pnpm test:e2e`   | Playwright suite against a throwaway DB on :3100    |
| `pnpm test:e2e:ui`| Same, in the headed Playwright debugger             |

## Testing

The e2e suite covers every public page (including SEO rules), every admin manager, the API routes and a public-to-admin flow. It never touches real content: tests run against the `bakerydelight_test` database on the same MongoDB server as `.env.local`, and Cloudinary is disabled so uploads fall back to DB storage.

First run: `pnpm exec playwright install chromium`. Then `pnpm test:e2e` (needs a reachable MongoDB and real admin credentials in `.env.local`).

## Documentation

- [AGENTS.md](./AGENTS.md) — architecture, conventions, testing and the rules agents follow when working in this repo
- [DESIGN.md](./DESIGN.md) — design direction: color tokens, type scale, spacing, motion and voice
