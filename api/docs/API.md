# BOLD API v1 — endpoints

Base path: `/api/v1` (prepend your host, e.g. `http://localhost:3000/api/v1`).

Auth: `Authorization: Bearer <accessToken>` unless noted.

## Health

**GET /health**

```json
{ "status": "ok", "database": "connected" }
```

## Auth

**POST /auth/signup**

```json
{ "dialCode": "852", "phone": "91234567", "password": "memberpass1" }
```

→ `201`

```json
{
  "accessToken": "<jwt>",
  "user": { "dialCode": "852", "phone": "91234567", "role": "member" }
}
```

**POST /auth/login** — same body → same shape.

**POST /auth/logout** — auth required → `{ "ok": true }`

**GET /auth/me** — auth required

```json
{ "dialCode": "852", "phone": "91234567", "role": "member" }
```

## Settings

**GET /settings**

```json
{ "guestBookingEnabled": true }
```

**PATCH /settings** (admin)

```json
{ "guestBookingEnabled": false }
```

## Courts

**GET /courts**

```json
[
  { "id": 1, "inMaintenance": false },
  { "id": 3, "inMaintenance": true }
]
```

**PATCH /admin/courts/:id/maintenance** (admin)

```json
{ "inMaintenance": true }
```

## Bookings

**GET /bookings/slots**

```json
{ "slots": ["06:00", "07:00", "…", "22:00"] }
```

**GET /bookings/day?date=2026-11-18**

```json
[{ "courtId": 5, "time": "18:00" }]
```

**GET /bookings/availability?date=2026-11-18&time=18:00**

```json
{
  "date": "2026-11-18",
  "time": "18:00",
  "courts": [
    { "courtId": 1, "available": true, "inMaintenance": false }
  ]
}
```

**POST /bookings** — auth optional if guest booking enabled; `guestName` required when logged out

```json
{
  "date": "2026-11-20",
  "time": "10:00",
  "courtId": 2,
  "guestName": "Alex Guest"
}
```

→ `201`

```json
{
  "id": "bp-173…",
  "date": "2026-11-20",
  "time": "10:00",
  "courtId": 2,
  "guestLabel": "Alex Guest",
  "status": "active",
  "paymentStatus": "awaiting_payment",
  "createdAt": "2026-11-16T…",
  "userId": null
}
```

Conflict on same court+date+time → `409`.

**GET /bookings/mine** — auth required → array of booking objects (only the caller’s bookings).

**POST /bookings/:id/cancel** — auth (owner or admin)

**GET /bookings/admin/overview** — admin → all active bookings.

## Content

**GET /content/site** — CMS payload (hero, 6 gallery images, featured, sideEvents, news publish flags).

**PUT /content/site** (admin) — same JSON shape as GET body.

**GET /content/facility** — facility image paths.

**PUT /content/facility** (admin)

**GET /events** — catalog metadata (ids, imageSrc, ctaHref, flags).

**GET /news** — catalog metadata.

**POST /admin/media** (admin) — optional data URL upload

```json
{ "dataUrl": "data:image/png;base64,…" }
```

→ `{ "ok": true, "src": "data:image/…" }`

## Admin members

**GET /admin/members** (admin)

```json
[
  {
    "id": "uuid",
    "dialCode": "852",
    "phone": "88888888",
    "role": "admin",
    "createdAt": "2026-11-16T…"
  }
]
```