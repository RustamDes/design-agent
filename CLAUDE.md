# CLAUDE.md — Design Agent

## Project Overview

Design Agent is a web application for product designers. It provides AI-assisted tools for generating UI components, validating design systems, and automating routine design workflows.

## Architecture

### Monorepo Layout

```
design-agent/
├── apps/
│   ├── web/          # Frontend — React + Vite + TypeScript + Tailwind v4
│   └── api/          # Backend  — Hono + Bun + Drizzle + PostgreSQL
└── packages/
    └── shared/       # Shared types and schemas (no runtime dependencies)
```

### apps/web

- Entry: `apps/web/src/main.tsx`
- Pages live in `src/pages/`, components in `src/components/`
- API calls go through `src/lib/api.ts` (typed fetch wrapper)
- Tailwind v4 config via CSS `@theme` directive in `src/index.css`
- Routing: React Router v7

### apps/api

- Entry: `apps/api/src/index.ts`
- Routes are registered in `src/routes/` and composed in `src/index.ts`
- DB access only through Drizzle client in `src/db/index.ts`
- Schema defined in `src/db/schema.ts`
- Middleware in `src/middleware/`
- Env vars validated with Zod at startup

### packages/shared

- Pure TypeScript — no framework dependencies
- Exports: Zod schemas, inferred TypeScript types, shared constants
- Both `apps/web` and `apps/api` import from `@design-agent/shared`

## Key Conventions

### TypeScript

- Strict mode enabled everywhere
- No `any` — use `unknown` and narrow
- Prefer `type` over `interface` for object shapes
- Zod schemas in `shared` are the single source of truth for data shapes

### API Design

- REST endpoints follow `/api/v1/<resource>` pattern
- Hono route files export a `Hono` instance, composed in `src/index.ts`
- Request/response types derived from Zod schemas in `@design-agent/shared`
- Errors return `{ error: string, code: string }` JSON

### Database

- Drizzle ORM — no raw SQL unless absolutely necessary
- Migrations live in `apps/api/drizzle/`
- Run migrations: `bun run db:migrate` inside `apps/api`
- Schema changes → update `src/db/schema.ts` → generate migration → commit both

### Frontend

- Components are function components with named exports
- No default exports for components — use named exports
- Co-locate component styles with the component file when using Tailwind variants
- Hooks live in `src/hooks/`, utilities in `src/lib/`
- Data fetching with TanStack Query; mutations invalidate relevant queries

### Code Quality

- No unused imports or variables (`noUnusedLocals`, `noUnusedParameters` enforced)
- Keep components small — extract logic into hooks when component exceeds ~150 lines
- Don't add error handling for impossible states
- Prefer explicit over implicit

## Common Commands

```bash
# From repo root
bun dev             # start all apps
bun build           # build all apps
bun typecheck       # typecheck all packages

# From apps/api
bun run db:generate # generate Drizzle migration
bun run db:migrate  # apply migrations
bun run db:studio   # open Drizzle Studio
```

## Environment

- Runtime: Bun (not Node)
- DB: PostgreSQL 16+
- Minimum required env vars before startup: `DATABASE_URL`
