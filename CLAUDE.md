# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrishop v2 is an inventory and sales management system for a clothing boutique. Built with **Next.js 14 (App Router)** and **Convex** as the real-time serverless backend. The UI is French-facing (business operates in DRC).

## Commands

```bash
npm run dev          # Start dev server on port 9000
npm run build        # Production build
npm run lint         # ESLint
npm run seed         # Seed admin user from convex/seedData.json
npx convex dev       # Run Convex dev server (needed alongside Next.js dev)
```

No test framework is configured.

## Architecture

### Frontend (src/)

- **Next.js App Router** with two route groups:
  - `(auth)` — Login page (public)
  - `(dashboard)` — All protected routes: products, orders, inventories, locations, users, profile
- **Auth guard** is client-side only, implemented in `src/app/(dashboard)/layout.tsx` via `useConvexAuth()`
- **Path alias:** `@/*` maps to `./src/*`

### Backend (convex/)

- **convex/schema.ts** — Database tables: users, products, locations, inventories, orders, orderItems
- **convex/functions/** — All business logic (queries, mutations, actions)
- **convex/lib/auth.ts** — `getCurrentUser()`, `requireCurrentUser()`, `requireRole()` helpers
- **convex/lib/password.ts** — SHA-512 password hashing with salt
- **convex/_generated/** — Auto-generated types (do not edit)

### Authentication

Dual-layer: custom credential validation (convex/functions/authActions.ts) + Convex Auth session management (@convex-dev/auth). Login flow validates credentials manually, then creates a Convex Auth session. First-time login forces password change.

### Role System

Four roles: `ADMIN`, `MANAGER`, `SELLER`, `CASHIER` (defined in `src/interface/roles.ts`).

- **Route-level:** `src/constants/pageRoles.ts` maps paths to allowed roles
- **Hook:** `src/hooks/usePermission.ts` checks access based on current path + user role
- **Backend:** Functions filter data by user role/location (non-admins see only their location's data)
- Admin-only pages: `/users`, `/locations`

### Key Patterns

- **Data fetching:** Convex React hooks (`useQuery`, `useMutation`, `useAction`) for real-time data
- **Error handling:** `useActionWithToast` and `useMutationWithToast` wrap Convex calls with toast notifications
- **State:** Zustand stores for modals (`useModalStore`), table config (`useTableStore`), metadata (`useMetaStore`)
- **Forms:** react-hook-form + Zod schemas (in `src/schemas/`)
- **UI components:** shadcn/ui (in `src/components/ui/`), custom components in `src/components/custom/`
- **Tables:** @tanstack/react-table

### Business Logic

- **Products** are identified by composite name: `type|brand|color|size|collarColor`. Bulk creation generates combinations from multi-select inputs.
- **Inventory** tracks quantity per product per location. `locationId=null` means central depot. Upserts on add (no duplicate product+location entries).
- **Transfers** move stock between locations with automatic inventory adjustments.
- **Orders** deduct inventory on creation, release on cancellation. Status flow: PENDING → PAID or CANCEL.
- **Stock levels:** OUT_OF_STOCK (≤0), LOW_STOCK (<25), IN_STOCK (≥25).

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_CONVEX_URL=<convex-deployment-url>
CONVEX_DEPLOYMENT=<dev-or-prod-deployment>
NEXT_PUBLIC_CONVEX_SITE_URL=<convex-site-url>
CONVEX_SITE_URL=<for-auth-config>
MAILJET_API_KEY=<api-key>
MAILJET_SECRET_KEY=<secret-key>
MAILJET_SENDER=<sender-email>
```
