# FinTrack Client

The FinTrack web client is a responsive Next.js App Router application for authentication, transaction management, analytics, profile settings, and live backend-status communication.

## Purpose

- Serve the public landing and footer information pages
- Provide login and registration flows
- Display dashboard analytics and transaction history
- Keep demo-server availability visible and recoverable
- Apply the signed-in user's INR or USD display preference

## Stack

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS 4
- shadcn/ui and Radix UI primitives
- Zustand and React Hook Form
- Zod and Axios
- Recharts and Framer Motion
- `next-themes`

## Structure

```text
src/
├── app/                # Routes, layouts, loading/error/not-found
├── components/
│   ├── auth/           # Route guards and auth provider
│   ├── dashboard/      # Dashboard-specific UI
│   ├── landing/        # Landing and demo availability sections
│   ├── layout/         # Navbar and footer
│   ├── shared/         # Filters, status, info, and theme providers
│   ├── transactions/   # Transaction form dialog
│   └── ui/             # shadcn primitives
├── hooks/              # Auth, dashboard, and demo-login hooks
├── lib/                # Axios, formatting, site config, backend status
├── providers/          # Backend status provider
├── store/              # Zustand auth state
└── types/              # Shared API and auth types
```

## Environment

Copy `.env.example` to `.env.local`.

| Variable | Purpose |
|---|---|
| `API_ORIGIN` | Express origin used by the server-side Next.js rewrite |
| `NEXT_PUBLIC_APP_URL` | Public site URL for metadata, robots, and sitemap |
| `NEXT_PUBLIC_DEMO_VIDEO_URL` | Optional public video walkthrough URL |

Example:

```env
API_ORIGIN=http://localhost:10000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEMO_VIDEO_URL=
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start Next.js development mode |
| `npm run typecheck` | Run TypeScript without emitting |
| `npm run lint` | Run ESLint |
| `npm run build` | Create the production build |
| `npm run start` | Serve the production build |

## Design System

The theme defaults to dark mode and supports a light toggle.

| Token | Dark | Light |
|---|---|---|
| Background | `#0e110c` | `#f6f7ef` |
| Card/surface | `#151a12` | `#ffffff` |
| Elevated | `#1c2217` | `#f0f2e7` |
| Foreground | `#f1f3e8` | `#1b2014` |
| Primary olive | `#8da242` | `#6b7f2a` |
| Accent sand | `#e9e2c8` | `#7b7047` |
| Expense | `#c8553d` | `#b44d38` |
| Income/sage | `#5fa58a` | `#4c9075` |

CSS utilities include `.gradient-text`, `.gradient-olive`, `.glass`, `.glow-olive`, and a subtle grain utility. Inter and Plus Jakarta Sans are loaded through `next/font`.

## Key Pages

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Landing page, demo availability, FAQ, and chart previews |
| `/auth` | Guest | Login and registration |
| `/dashboard` | Protected | Summary cards and charts |
| `/transactions` | Protected | Searchable, filterable transaction history |
| `/profile` | Protected | Profile, currency, password, and sign-out |
| `/[slug]` | Public | About, pricing, legal, help, and company pages |

## State and Data Fetching

- Zustand stores the authenticated user and loading state.
- `AuthProvider` loads `/auth/me` on startup.
- Protected and guest route wrappers redirect based on auth state.
- Dashboard values use dedicated hooks for summary, categories, monthly trends, and recent transactions.
- Axios sends cookies with every request and normalizes API errors.
- A `502`, `503`, `504`, network error, or `DB_UNAVAILABLE` response dispatches a backend-availability event instead of an authentication redirect.
- Only protected `401` responses redirect to `/auth`.

## Charts

Recharts supplies the landing preview, dashboard category donut, and grouped monthly bar chart. Dashboard legends, tooltips, empty states, and responsive containers remain usable on small screens.

## Rewrite Proxy

`next.config.ts` rewrites:

```text
/api/:path* -> ${API_ORIGIN}/api/:path*
```

This keeps browser code on relative `/api/...` paths, sends cookies through the Next.js proxy, and avoids a hardcoded production API hostname. `API_ORIGIN` must be set in production.
