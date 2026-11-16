# BOLD Pickleball API (NestJS + PostgreSQL)

NestJS service under `/api/v1` with plain SQL via `pg` (no ORM). Pair with the Astro frontend by setting `PUBLIC_API_BASE` (see repo `.env.example`).

## Quick start (Docker)

From the repo root:

```bash
docker compose up --build
```

- API: `http://localhost:3000/api/v1`
- Postgres: `localhost:5432` (user/password/db: `bold` / `bold` / `bold`)

Migrations and seed run automatically when the API container starts.

## Local development (no Docker for API)

1. Start Postgres (`docker compose up postgres` or your own instance).
2. Copy `api/.env.example` → `api/.env` and adjust `DATABASE_URL`.
3. In `api/`:

```bash
npm install
npm run db:setup
npm run start:dev
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWTs (use a long random value in production) |
| `PORT` | HTTP port (default `3000`) |
| `CORS_ORIGINS` | Comma-separated browser origins allowed to call the API |

Frontend (Astro root `.env`):

| Variable | Description |
|----------|-------------|
| `PUBLIC_API_BASE` | Full API prefix, e.g. `http://localhost:3000/api/v1` |

## Exposing a public HTTPS API (preview)

Run the stack on a host with a public URL (VPS, tunnel, etc.):

1. Set `JWT_SECRET` and production `DATABASE_URL` in the API environment.
2. Set `CORS_ORIGINS` to include every origin that will load the frontend preview (e.g. `https://waitengchong.github.io` and your preview host).
3. Terminate TLS on reverse proxy (Caddy, nginx, Cloudflare Tunnel) and forward to `PORT` (3000).
4. Point the Astro preview at `PUBLIC_API_BASE=https://your-api.example.com/api/v1`.

Do **not** merge this PR for production GitHub Pages — the static site at `https://waitengchong.github.io/Bold-website/` stays on demo localStorage unless a coordinator wires preview env vars.

## Seed admin

| Field | Value |
|-------|--------|
| Dial code | `852` |
| Phone | `88888888` |
| Password | `admin1234` |

Password is only in this README and the database hash — not in frontend source.

## Scripts

| Command | Action |
|---------|--------|
| `npm run migrate` | Apply SQL migrations in `db/migrations/` |
| `npm run seed` | Idempotent seed (courts, admin, bookings, CMS JSON) |
| `npm run build` | Compile NestJS |
| `npm run start` | Run compiled server |

## Endpoint reference

See [docs/API.md](./docs/API.md) for the full list with example requests and responses.

## Proof checklist

- `GET /api/v1/health` → 200 JSON after Postgres is up
- Auth issues JWT; passwords stored as bcrypt hashes
- Bookings enforce slot conflicts, maintenance courts, guest rule via `guestBookingEnabled`
- CMS `PUT /content/site` visible on next `GET /content/site`
- Cancel: `POST /bookings/:id/cancel` (member own booking or admin)