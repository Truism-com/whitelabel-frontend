# White-Label Flight Booking Platform

A multi-tenant, white-label flight booking platform built with **Next.js 16** and
**Tailwind CSS v4**. A single deployment powers three role-based portals plus a
public marketing site, with per-tenant branding driven by CSS variables.

> **Status:** Frontend is feature-complete and type-safe (`tsc` clean). It talks
> to a separate backend API (FastAPI-style) over REST. Many screens are fully
> wired to that API; the backend itself must implement the endpoints listed in
> [Backend API Contract](#backend-api-contract). See [Project Status](#project-status).

---

## Table of Contents
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Backend API Contract](#backend-api-contract)
- [Project Status](#project-status)
- [Known Gaps / TODO](#known-gaps--todo)
- [Contributor Notes](#contributor-notes)

---

## Architecture

The app serves **three portals** behind a shared design system and data layer:

| Portal       | Route prefix | Audience                | Auth role             |
| ------------ | ------------ | ----------------------- | --------------------- |
| **Admin**    | `/admin`     | Business owner (tenant) | `admin`, `superadmin` |
| **Agent**    | `/agent`     | Travel agent            | `agent`               |
| **Customer** | `/my`        | End traveller (B2C)     | `customer`            |
| Public site  | `/`          | Anyone                  | — (no auth)           |
| Auth         | `/login`, `/register`, `/forgot-password` | — | — |

Each portal has its own layout, sidebar/navbar, and **client-side auth guard**
that redirects users without the correct role.

**Multi-tenancy:** A tenant is identified by subdomain (e.g.
`myagency.flightdesk.in`). Tenant brand colors are applied as CSS custom
properties (`--tenant-primary`, etc.) on `<html>` at runtime via
`TenantProvider`.

---

## Tech Stack

| Concern          | Library                                   |
| ---------------- | ----------------------------------------- |
| Framework        | Next.js 16 (App Router) + React 19        |
| Styling          | Tailwind CSS v4                           |
| Server state     | TanStack Query v5                         |
| Client state     | Zustand v5 (persisted auth + tenant)      |
| Forms            | React Hook Form + Zod v4                  |
| HTTP             | Axios (JWT attach + silent refresh)       |
| Charts           | Recharts                                  |
| Toasts           | Sonner                                    |
| Icons            | Lucide React                              |
| Class utils      | clsx + tailwind-merge (`cn()`)            |

---

## Getting Started

### Prerequisites
- **Node.js 20+**
- A running backend API (see [Backend API Contract](#backend-api-contract)).
  Defaults to `http://localhost:8000`.

### Install & run
```bash
npm install
cp .env.local.example .env.local   # then edit values
npm run dev                        # http://localhost:3000
```

### Scripts
| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start dev server (Turbopack) |
| `npm run build` | Production build             |
| `npm run start` | Serve production build       |
| `npm run lint`  | Run ESLint                   |

---

## Environment Variables

Copy `.env.local.example` → `.env.local`:

| Variable                       | Required | Description                                      |
| ------------------------------ | -------- | ------------------------------------------------ |
| `NEXT_PUBLIC_API_URL`          | yes      | Base URL of the backend API (no trailing `/`)    |
| `NEXT_PUBLIC_APP_URL`          | no       | Public URL of this frontend                      |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID`  | no       | Razorpay **public** key (checkout not yet wired) |

> Never put secret keys in `NEXT_PUBLIC_*` vars — they are exposed to the browser.

---

## Project Structure

```
app/                              # App Router — one folder per route
├── layout.tsx                    # Root layout → mounts <AppProviders>
├── page.tsx                      # Public landing page
├── globals.css                   # Tailwind + tenant CSS variables
│
├── (auth)/                       # Auth route group (shared split-screen layout)
│   ├── login/  register/  forgot-password/
│
├── admin/                        # ── Business-admin portal ──
│   ├── layout.tsx                # AdminAuthGuard + sidebar + header
│   ├── dashboard/                # Stats + booking-trend chart
│   ├── agents/  customers/  bookings/  wallet/
│   ├── pricing/   → markup-rules · discounts · fees
│   ├── cms/       → sliders · offers · blog · pages
│   ├── website/   → branding · templates
│   └── settings/  → company · roles · staff · system
│
├── agent/                        # ── Travel-agent portal ──
│   ├── layout.tsx
│   ├── dashboard/  wallet/  transactions/  profile/
│   └── bookings/  → list · new (flight search + book)
│
└── my/                           # ── Customer (B2C) portal ──
    ├── layout.tsx
    ├── dashboard/  search/  wallet/  profile/
    └── bookings/  → list · [id] (detail)

components/
├── home/         # Landing page sections (hero, features, footer, …)
├── auth/         # Shared auth side-panel
├── providers/    # app-providers, query-provider, tenant-provider
├── admin|agent|customer/layout/   # Per-portal sidebar / navbar / auth-guard
└── ui/           # Design system — 16 primitives (button, input, dialog, …)

lib/
├── api/          # Axios client + one module per domain
│                 #   client · auth · admin · agent · customer
│                 #   wallet · pricing · cms · tenant
├── hooks/        # TanStack Query wrappers (use-auth, use-admin, …)
├── stores/       # Zustand: auth.store (persisted) · tenant.store
├── types/        # Domain TypeScript types (one file per domain)
├── constants/    # Static data (site templates)
└── utils/        # cn() class helper

proxy.ts          # Tenant subdomain detection (NOT active — see TODO)
next.config.ts    # Turbopack root config
```

### Layer responsibilities
```
Page (app/**)  →  Hook (lib/hooks)  →  API module (lib/api)  →  Axios client
                         │
                         └─ feeds React Query cache; Zustand holds auth/tenant
```
- **Never call `apiClient` directly from a component.** Go through a hook so
  caching, loading, and error toasts stay consistent.
- Add new endpoints as a function in the matching `lib/api/*.ts`, type it in
  `lib/types/*.ts`, then expose it via a hook in `lib/hooks/*.ts`.

---

## How It Works

### Authentication
- `useAuth()` (`lib/hooks/use-auth.ts`) exposes `login`, `register`, `logout`,
  `refreshUser`.
- On login, JWT access + refresh tokens are stored in `localStorage`; the Axios
  request interceptor attaches the access token, and the response interceptor
  silently refreshes on `401` and retries the original request once.
- Auth state lives in `auth.store.ts` (Zustand, persisted). `isHydrated` guards
  against SSR/login flicker.
- Each portal layout wraps children in an **auth guard** that checks
  `user.role` and redirects if it doesn't match.

### Multi-tenant branding
- `TenantProvider` reads the `x-tenant-slug` cookie, fetches public tenant config
  (`/v1/config/public`), and writes `--tenant-*` CSS variables onto `<html>`.
- Falls back to `DEFAULT_TENANT_CONFIG` on the platform root domain.

### Forms
- React Hook Form + Zod everywhere. **Convention:** numeric inputs use
  `z.number()` + `register("field", { valueAsNumber: true })` (avoid
  `z.coerce`/`z.preprocess`, which break the resolver's generic typing).

---

## Backend API Contract

The frontend expects these REST endpoints at `NEXT_PUBLIC_API_URL`. Paginated
list endpoints may return `{ items, total }` or `{ results, total }` (the client
normalizes both). Monetary amounts are exchanged in **paise/cents** (integers).

<details>
<summary><b>Auth</b></summary>

```
POST /auth/register          POST /auth/login         POST /auth/refresh
POST /auth/logout            GET  /auth/me            PUT  /auth/me/password
POST /auth/forgot-password   POST /auth/reset_password
```
</details>

<details>
<summary><b>Admin</b></summary>

```
GET  /admin/dashboard/stats          GET  /admin/analytics/bookings
GET  /admin/users                    GET  /admin/bookings
GET/PUT /admin/company/profile       PUT  /admin/company/profile/branding
PUT  /admin/company/profile/seo
GET/POST/PUT/DELETE /admin/pricing/markup-rules
GET/POST/PUT/DELETE /admin/pricing/discount-rules
GET/POST/PUT/DELETE /admin/pricing/fee-slabs
POST /admin/wallet/credit            POST /admin/wallet/debit
POST /admin/wallet/credit-limit      GET  /admin/wallet/topup/pending
```
</details>

<details>
<summary><b>Agent / Customer / Shared</b></summary>

```
GET  /agent/stats                    GET  /agent/bookings
GET  /customer/stats                 GET  /customer/bookings
GET  /customer/bookings/upcoming     GET  /customer/wallet/topups
POST /flights/search                 POST /bookings
GET  /wallet/                        GET  /wallet/transactions
POST /wallet/topup/request
```
</details>

<details>
<summary><b>Tenant (platform)</b></summary>

```
GET  /v1/config/public               GET/POST /v1/admin/tenants
PUT  /v1/admin/config/branding
```
</details>

---

## Project Status

### ✅ Implemented (frontend)
- **Auth** — login, register, forgot-password; token refresh; persisted session; per-role guards
- **Admin portal** — dashboard (stats + Recharts), agents, customers, bookings, wallet/top-ups, full pricing CRUD (markup/discount/fee), full CMS CRUD (sliders/offers/blog/pages), website branding & templates, settings (company/roles/staff/system)
- **Agent portal** — dashboard, flight search → book, bookings list, wallet + top-up request, transactions, profile
- **Customer portal** — dashboard, flight search → book, bookings list + detail, wallet + top-up, profile
- **Design system** — 16 reusable UI primitives
- **Data layer** — 9 API modules, 7 query hooks, 2 Zustand stores, typed end-to-end
- **Tenant branding** — runtime CSS-variable theming
- Compiles clean: `npx tsc --noEmit` passes with zero errors

### 🚧 Needs work
- **Backend** — the API endpoints above must exist and return the shapes in `lib/types/*`. The UI is built against them but cannot be exercised without the backend.
- **Multi-tenant middleware is inactive** — `proxy.ts` contains the subdomain→tenant logic, but Next.js only runs a file named `middleware.ts` exporting `middleware`. Rename/rewire to activate.
- **Payments** — top-ups are manual (request → admin approves). Razorpay checkout is not implemented (only the public-key env var is stubbed).
- **SuperAdmin/Owner UI** — tenant-management endpoints exist in `lib/api/tenant.ts`, but there are no `/superadmin` pages yet.
- **No automated tests.**
- **Email / real-time notifications** — not implemented (header bell is decorative).

---

## Known Gaps / TODO

- [ ] Activate tenant middleware (`proxy.ts` → `middleware.ts`)
- [ ] Server-side tenant config injection into root layout (currently client-only fallback)
- [ ] Razorpay (or other gateway) checkout flow
- [ ] SuperAdmin portal for cross-tenant management
- [ ] Agent booking detail page (`/agent/bookings/[id]`) — customer side already has it
- [ ] `not-found.tsx` / `error.tsx` / `loading.tsx` per segment
- [ ] Reset-password page (`/reset-password?token=…`) — API call exists, no page
- [ ] Unit / E2E tests
- [ ] Move JWTs from `localStorage` to httpOnly cookies before production (XSS hardening)

---

## Contributor Notes

- **Adding a feature?** Page → hook → api → type. Keep network logic out of components.
- **Money is in paise/cents.** Divide by 100 for display: `₹{(amount/100).toLocaleString("en-IN")}`.
- **Tokens in `localStorage`** is convenient but XSS-exposed — see TODO before shipping.
- **Git:** if this working copy is a detached worktree, turn it into a standalone
  repo before pushing to GitHub — remove the stale `.git` pointer and re-init
  (ask before any destructive git operation):
```bash
rm .git && git init && git add -A && git commit -m "Initial commit: FlightDesk frontend"
```
