# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev              # Dev server on :3000
bun run build        # Production build
bun run lint         # ESLint
npx prisma migrate dev --name <name>   # Create migration
npx prisma db seed   # Seed database (admin/admin123)
```

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Prisma v7** with `prisma-client` generator → output at `src/generated/prisma/client`
- **PostgreSQL** (container `shopify-tanstack-postgres`, db `info_app`, postgres/postgres@localhost:5432)
- **NextAuth v5** (beta) with credentials provider, JWT sessions
- **Tailwind CSS v4** (CSS-first config in `globals.css`, no `tailwind.config.js`) + **shadcn/ui v3** (new-york style)
- **Package manager: bun**

## Architecture

### Prisma v7 — No URL in schema

`schema.prisma` has no `url` in datasource. The connection URL is configured in `prisma.config.ts` via `defineConfig({ datasource: { url } })`. PrismaClient must be instantiated with `@prisma/adapter-pg`:

```ts
import { PrismaClient } from "@/generated/prisma/client"  // NOT @prisma/client
import { PrismaPg } from "@prisma/adapter-pg"
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })
```

### NextAuth v5 — Split config for Edge compatibility

Prisma and bcrypt cannot run in Edge Runtime, so auth config is split:

- `src/auth.config.ts` — Edge-safe config (JWT callbacks, route protection, stub authorize). Used by middleware.
- `src/auth.ts` — Full config with Prisma lookup + bcrypt password verification. Used by API routes and server components.
- `src/middleware.ts` — Imports only from `auth.config.ts`. Protects `/dashboard`, `/profile`, `/schedule`, `/notes` and their API counterparts.

### Route groups

- `src/app/(app)/` — Authenticated pages. Layout fetches user profile, renders Sidebar + Topbar.
- `src/app/(auth)/` — Login page (unauthenticated).
- `src/app/api/` — REST endpoints for events, notes, profile, work, avatar upload.

### Data model

Five Prisma models: `User` → has one `Profile`, one `Work`, many `Events`, many `Notes`. All relations cascade delete from User.

- Events support recurrence via `repeatRule` (RRULE string) and `isArchived` soft-delete.
- Notes have PostgreSQL array `tags` field, `isPinned`, and `isArchived` soft-delete.

### Forms and validation

Forms use `react-hook-form` + `zod` schemas + `@hookform/resolvers`. Toast notifications via `sonner`.

### UI language

The app UI is in Vietnamese.
