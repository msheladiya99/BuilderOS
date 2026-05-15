# BuilderOS Frontend

React + Vite + TypeScript + Tailwind CSS.

## Environment

Copy `frontend/.env.example` → `frontend/.env`.

| Variable | Purpose |
|----------|---------|
| `VITE_APP_NAME` | App title |
| `VITE_API_URL` | Backend URL (Vite proxies `/api` here) |
| `VITE_MAIN_DOMAIN` | Main domain for tenant links |

Only variables prefixed with `VITE_` are available in the browser via `import.meta.env`.

## Run

```bash
npm run dev
# from repo root: npm run dev:frontend
```
