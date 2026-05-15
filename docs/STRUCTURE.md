# Production folder structure

## Design principles

1. **`apps/`** — deployable applications (api, web)
2. **`packages/`** — shared libraries consumed by apps
3. **`database/`** — schema & migrations (single source of truth)
4. **`infrastructure/`** — Docker, K8s, Terraform (future)
5. **`docs/`** — architecture & runbooks

## Apps

### `apps/api` (@builderos/api)

- **Stack:** Node 20+, Express, TypeScript, PostgreSQL, Zod
- **Routes:**
  - `/api/*` — legacy-compatible (JSON store + full ERP UI)
  - `/api/v1/*` — REST (projects, units, owners/KYC)
- **Config:** `apps/api/.env`

### `apps/web` (@builderos/web)

- **Stack:** React 18, Vite 6, TypeScript, Tailwind 4
- **Config:** `apps/web/.env` (`VITE_*` only)

## Database

| Path | Purpose |
|------|---------|
| `database/schema/001_public.sql` | Companies, users, plans |
| `database/schema/002_tenant_template.sql` | Per-tenant tables |
| `database/scripts/migrate.ts` | Apply public schema |
| `database/scripts/seed.ts` | Demo data |

## What not to commit

- `node_modules/`
- `apps/api/.env`, `apps/web/.env`
- `apps/api/data/store.json`
