CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dial_code TEXT NOT NULL,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (dial_code, phone)
);

CREATE TABLE IF NOT EXISTS courts (
  id INT PRIMARY KEY CHECK (id BETWEEN 1 AND 8),
  in_maintenance BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users (id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  court_id INT NOT NULL REFERENCES courts (id),
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'awaiting_payment',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS bookings_active_slot
  ON bookings (court_id, booking_date, booking_time)
  WHERE status = 'active';

CREATE TABLE IF NOT EXISTS app_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  guest_booking_enabled BOOLEAN NOT NULL DEFAULT true
);

INSERT INTO app_settings (id, guest_booking_enabled)
VALUES (1, true)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS site_content (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS facility_content (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS content_catalog (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('event', 'news')),
  payload JSONB NOT NULL
);