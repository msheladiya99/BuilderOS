# BuilderOS — Real Estate ERP

Full-stack Builder Management System from Figma design.

**Figma:** https://www.figma.com/design/VJ6cO2r3bLzEOZcnWEfqOq/builder

## Stack

- **Frontend:** React 18, Vite 6, Tailwind CSS 4, React Router 7, Recharts
- **Backend:** Node.js, Express, JSON file database (persistent)

## Quick start

```bash
npm install
npm run dev
```

Opens:
- **App:** http://localhost:5173
- **API:** http://localhost:3001

## Demo login

| Role | Email | Password | OTP |
|------|-------|----------|-----|
| Admin | arjun@builderos.in | password | 123456 |
| Sales | sales@builderos.in | password | 123456 |
| Accounts | accounts@builderos.in | password | 123456 |
| Site | site@builderos.in | password | 123456 |

## Features

- Role-based navigation (admin, sales, accounts, site)
- JWT auth with OTP verification
- REST API with CRUD for projects, units, customers, leads, payments
- Live dashboard from API data
- Persistent database (`server/data.json`)
- Dark mode, offline banner, project switcher

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API + frontend together |
| `npm run dev:client` | Frontend only |
| `npm run dev:server` | API only |
| `npm run build` | Production build |
| `npm start` | Run API server |

## API

Base URL: `http://localhost:3001/api`

- `POST /auth/login` — validate credentials
- `POST /auth/verify-otp` — get JWT token
- `GET /bootstrap` — all app data
- `GET /dashboard` — dashboard aggregates
- CRUD: `/projects`, `/units`, `/customers`, `/leads`, `/payments`, etc.

Reset database: `POST /api/admin/reset`

## Project structure

```
src/
  app/           # Pages & modules (Figma UI)
  context/       # Auth, data, theme
  lib/           # API client
  types/         # TypeScript types
server/
  index.js       # Express API
  seed.json      # Initial data
  data.json      # Runtime DB (auto-created)
```
