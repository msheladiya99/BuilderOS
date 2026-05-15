# BuilderOS

Enterprise ERP for real-estate builders — production monorepo.

## Project structure

```
builder-project/
├── apps/
│   ├── api/                 # Express + TypeScript API (PostgreSQL)
│   │   ├── src/
│   │   ├── data/            # JSON demo store (runtime)
│   │   ├── .env             # Backend secrets (not committed)
│   │   └── package.json
│   └── web/                 # React + Vite SPA
│       ├── src/
│       ├── .env             # VITE_* public config
│       └── package.json
├── packages/
│   └── shared/              # Shared Zod schemas & types
├── database/
│   ├── schema/              # PostgreSQL DDL
│   └── scripts/             # migrate.ts, seed.ts
├── infrastructure/
│   └── docker-compose.yml   # PostgreSQL + Redis
├── docs/                    # Architecture & phase docs
└── package.json             # npm workspaces root
```

## Quick start

```bash
# 1. Install (from repo root)
npm install

# 2. Environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 3. Database (optional — API falls back to JSON demo mode)
npm run docker:up
npm run db:migrate
npm run db:seed

# 4. Run API + web
npm run dev
```

| App | URL |
|-----|-----|
| Web | http://localhost:5173 |
| API | http://localhost:3001/api |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | API + web together |
| `npm run dev:api` | Backend only |
| `npm run dev:web` | Frontend only |
| `npm run db:migrate` | Apply PostgreSQL schema |
| `npm run db:seed` | Demo tenants & users |
| `npm run docker:up` | Start Postgres + Redis |

## Demo login

- **Super Admin:** `superadmin@builderos.in` / `password` / OTP `123456`
- **Tenant:** `http://skyline-heights.localhost:5173/login` — `arjun@builderos.in` / `password`

## Legacy folders

`backend/` and `frontend/` at the repo root are **deprecated** — use `apps/api` and `apps/web`. Safe to delete after stopping the dev server.
