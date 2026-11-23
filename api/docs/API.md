# BOLD API v1 — endpoints

Base path: `/api/v1` (prepend your host, e.g. `http://localhost:3000/api/v1`).

Auth: `Authorization: Bearer <accessToken>` unless noted.

Member and staff use **separate JWT audiences** (`aud`: `member` | `staff`). A member token must not call staff/console routes; a staff token must not call member routes (e.g. `/auth/me`, `/bookings/mine`).

## Health

**GET /health**

```json
{ "status": "ok", "database": "connected" }
```

## Auth

**POST /auth/signup** — creates **members** only

```json
{
  "dialCode": "852",
  "phone": "91234567",
  "password": "memberpass1",
  "surname": "Chan",
  "givenName": "Tai",
  "dateOfBirth": "1990-05-01",
  "gender": "male",
  "email": "tai@example.com",
  "preferredLanguage": "zh",
  "consentEmail": true,
  "consentWhatsapp": false,
  "emergencyContactName": "Emergency",
  "emergencyContactPhone": "90001111"
}
```

Optional: `preferredLanguage`, consent fields, emergency contact. Rejects `role: "admin"` and phones already in `staff`.

**POST /auth/login** — member credentials only (`aud: member`)

```json
{ "dialCode": "852", "phone": "91234567", "password": "memberpass1" }
```

**POST /auth/staff/login** — staff credentials only (`aud: staff`)

```json
{ "dialCode": "852", "phone": "88888888", "password": "admin1234" }
```

**POST /auth/logout** — auth required → `{ "ok": true }`

**GET /auth/me** — member token → full profile (incl. surname, email, DOB, gender, consents).

**PATCH /auth/me** — member token; update profile (phone not editable).

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

## Admin (staff token, `aud: staff`)

**GET /admin/members** — list `members` rows (profile fields).

**GET /admin/staff** — admin role only.

**POST /admin/staff** — admin role only; create staff (cannot reuse a member phone).

```json
{
  "dialCode": "852",
  "phone": "91112222",
  "password": "staffpass1",
  "surname": "Wong",
  "givenName": "Pat",
  "email": "pat@bold.example",
  "role": "staff"
}
```