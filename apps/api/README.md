# BuilderOS Backend

Proper **Node.js + Express + TypeScript** API with **PostgreSQL** (production) and **JSON module store** (demo ERP modules).

## Folder structure

```
backend/
├── src/
│   ├── index.ts              # Server entry
│   ├── config/env.ts         # Environment (.env)
│   ├── db/                   # PostgreSQL pool + tenant helpers
│   ├── middleware/           # Auth, validation, errors
│   ├── routes/
│   │   ├── compat.routes.ts  # /api/*  (existing React UI)
│   │   └── v1/               # /api/v1/* (REST + Owner KYC)
│   ├── services/             # Business logic
│   └── schemas/              # Zod validation
├── database/scripts/         # migrate.ts, seed.ts
├── data/
│   ├── seed.json             # Demo ERP data (customers, CRM, etc.)
│   └── store.json            # Runtime copy (auto-created, gitignored)
└── legacy-json/              # Old index.js + db.js (archived)
```

## API surfaces

| Path | Purpose |
|------|---------|
| `/api/*` | Legacy-compatible routes for the full ERP UI |
| `/api/v1/*` | PostgreSQL REST API (projects, units, owners/KYC) |

## Run

```bash
# From repo root
npm run dev:backend

# Or with PostgreSQL (recommended)
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev
```

## Environment

Copy `backend/.env.example` → `backend/.env`. Key variables:

- `API_PORT=3001`
- `DATABASE_URL=postgresql://builderos:builderos_dev@localhost:5432/builderos`
- `JWT_SECRET=...` (min 16 chars)

Without PostgreSQL, the server still runs in **JSON demo mode** for `/api/*`.
