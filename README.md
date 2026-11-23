# BOLD Pickleball (Astro)

Marketing site + member booking UI for BOLD Pickleball. Static hosting uses demo `localStorage` data unless you point the frontend at the NestJS API.

## Frontend (Astro)

```bash
npm install
npm run dev
```

Site base path: `/Bold-website` (GitHub Pages).

### API preview mode

Copy `.env.example` → `.env` and set:

```bash
PUBLIC_API_BASE=http://localhost:3000/api/v1
```

Restart `npm run dev`. Auth, bookings, CMS, and court maintenance use the API; JWT is stored in `localStorage` as `bold_api_token`.

## Backend (NestJS + PostgreSQL)

See [api/README.md](./api/README.md) and [api/docs/API.md](./api/docs/API.md).

Quick start:

```bash
docker compose up --build
```

## Cut 2026-11-16

- Adds `api/` (NestJS, plain SQL, JWT auth, bookings, CMS, admin)
- Wires React islands when `PUBLIC_API_BASE` is set
- Does **not** change production GitHub Pages behavior without that env var
