# Design Agent

AI-powered tool for product designers. Automates routine design tasks, generates UI components, validates design systems, and integrates with design tools like Figma and Pencil.

## Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 19, Vite, TypeScript, Tailwind v4 |
| Backend   | Hono, TypeScript, Bun runtime           |
| Database  | PostgreSQL + Drizzle ORM                |
| Monorepo  | Bun workspaces                          |

## Project Structure

```
design-agent/
├── apps/
│   ├── web/          # React frontend (Vite + TypeScript + Tailwind)
│   └── api/          # Hono backend (REST API)
├── packages/
│   └── shared/       # Shared types and utilities
├── package.json      # Workspace root
└── tsconfig.json     # Base TypeScript config
```

## Getting Started

```bash
# Install dependencies
bun install

# Run all apps in development mode
bun dev

# Run only frontend
bun dev:web

# Run only backend
bun dev:api
```

## Environment Variables

Copy `.env.example` to `.env` in each app directory and fill in the values.

### apps/api/.env
```
DATABASE_URL=postgresql://user:password@localhost:5432/design_agent
PORT=3001
```

### apps/web/.env
```
VITE_API_URL=http://localhost:3001
```
