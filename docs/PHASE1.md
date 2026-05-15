# Phase 1 — MVP Foundation

## What was added

| Deliverable | Location |
|-------------|----------|
| Folder structure | `apps/api/`, `packages/shared/`, `database/` |
| PostgreSQL DDL | `database/schema/001_public.sql`, `002_tenant_template.sql` |
| Auth + subdomain tenants | `apps/api/src/routes/v1/auth.routes.ts`, `tenant.routes.ts` |
| Projects & units CRUD | `apps/api/src/routes/v1/projects.routes.ts`, `units.routes.ts` |
| Owner KYC API + UI | `owners.routes.ts`, `frontend/.../OwnerKycModule.tsx` |
| Zod validation | `packages/shared/src/schemas/` |

## Target stack (your spec)

| Layer | Phase 1 | Later phases |
|-------|---------|--------------|
| Frontend | React + Vite + TS | Next.js (optional migration) |
| Backend | Express + TypeScript | Same |
| Database | PostgreSQL schema-per-tenant | Same |
| Cache | Redis in docker-compose | Wire in Phase 2 |
| Storage | Demo URLs | S3 Phase 2 |
| Offline | — | PWA + IndexedDB Phase 3 |

## Quick start

```bash
# 1. Start databases
docker compose up -d

# 2. Environment
cp .env.example .env

# 3. Install API deps
cd apps/api && npm install

# 4. Migrate + seed
npm run db:migrate
npm run db:seed

# 5. Run everything (from repo root)
cd ../..
npm install
npm run dev
```

## API endpoints (`/api/v1`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/tenant/:subdomain` | Resolve portal |
| POST | `/auth/login` | Login (returns OTP step) |
| POST | `/auth/verify-otp` | OTP → JWT |
| GET | `/auth/me` | Current user |
| CRUD | `/projects` | Projects (tenant JWT) |
| CRUD | `/units` | Units (tenant JWT) |
| CRUD | `/owners` | Owners + KYC |

## Demo logins

| Portal | URL | User |
|--------|-----|------|
| Super Admin | `http://localhost:5173/login` | `superadmin@builderos.in` / `password` / OTP `123456` |
| Skyline Heights | `http://skyline-heights.localhost:5173/login` | `arjun@builderos.in` / `password` / OTP `123456` |

Owner KYC screen: **Owner KYC** in sidebar (tenant login required).

## Legacy API

The JSON file API in `backend/` still runs on port 3001 for existing modules. The new PostgreSQL API also uses port 3001 when started via `npm run dev:api` — use **only one** backend on 3001, or change `API_PORT` in `.env` to `3002` for the new API and update Vite proxy.

Recommended: set `API_PORT=3002` in `.env` and proxy `/api/v1` → 3002, `/api` → 3001 (legacy).
