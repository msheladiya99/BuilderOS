# BuilderOS — Architecture (Phase 1+)

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS 4 |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL 16 (schema-per-tenant) |
| Cache | Redis 7 (sessions, rate limits — Phase 2+) |
| Storage | S3-compatible (documents — Phase 2+) |
| Mobile | PWA + Service Worker + IndexedDB (Phase 3) |

> **Note:** Production roadmap includes **Next.js** for SSR/SEO; Phase 1 keeps the existing Vite SPA and adds `/api/v1` integration.

## Monorepo layout

```
builder-project/
├── apps/
│   └── api/                    # Express + TypeScript REST API (/api/v1)
├── packages/
│   └── shared/                 # Zod schemas + shared types
├── database/
│   ├── schema/                 # PostgreSQL DDL (public + tenant template)
│   └── scripts/                # migrate, seed, provision-tenant
├── frontend/                   # React SPA (port 5173)
├── backend/                    # Legacy JSON API (port 3002, demo modules)
├── docker-compose.yml          # PostgreSQL + Redis
└── docs/
```

## Multi-tenancy

- **Public schema:** `companies`, `users`, `subscription_plans`, `global_config`, platform `audit_log`
- **Per-tenant schema:** `tenant_{subdomain}` — projects, units, owners, payments, expenses, …
- **Subdomain routing:** `skyline-heights.builderos.in` → resolves company → sets `search_path` to tenant schema
- **Super Admin:** main domain only; manages companies via public schema

## API versioning

All new endpoints: `/api/v1/*`

## Development phases

| Phase | Focus |
|-------|--------|
| 1 (MVP) | Auth, tenants, projects, units, owner KYC, basic payments/expenses, dashboard |
| 2 | Full accounting, materials, loans/insurance, documents, RERA |
| 3 | Offline PWA + sync, buyer portal, WhatsApp/SMS, GST/TDS, CRM |
| 4 | Reports, Gantt, audit trail, possession, society module |

## Run locally

```bash
docker compose up -d          # PostgreSQL + Redis
cp .env.example .env          # edit secrets
cd apps/api && npm install && npm run db:migrate && npm run db:seed
npm run dev                   # from repo root
```
