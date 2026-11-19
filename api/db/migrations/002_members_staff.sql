-- Cut 2026-11-17: split users into members + staff; global phone uniqueness

CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dial_code TEXT NOT NULL,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  surname TEXT NOT NULL DEFAULT '',
  given_name TEXT NOT NULL DEFAULT '',
  date_of_birth DATE,
  gender TEXT CHECK (gender IS NULL OR gender IN ('male', 'female', 'other', 'prefer_not')),
  email TEXT NOT NULL DEFAULT '',
  preferred_language TEXT CHECK (preferred_language IS NULL OR preferred_language IN ('zh', 'en')),
  consent_email BOOLEAN NOT NULL DEFAULT false,
  consent_whatsapp BOOLEAN NOT NULL DEFAULT false,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (dial_code, phone)
);

CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dial_code TEXT NOT NULL,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  surname TEXT NOT NULL DEFAULT '',
  given_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (dial_code, phone)
);

CREATE OR REPLACE FUNCTION bold_phone_cross_table_check() RETURNS trigger AS $$
BEGIN
  IF TG_TABLE_NAME = 'members' THEN
    IF EXISTS (
      SELECT 1 FROM staff s
      WHERE s.dial_code = NEW.dial_code AND s.phone = NEW.phone
        AND (TG_OP = 'INSERT' OR s.id IS DISTINCT FROM NULL)
    ) THEN
      RAISE EXCEPTION 'phone_in_use' USING ERRCODE = '23505';
    END IF;
    IF TG_OP = 'UPDATE' AND EXISTS (
      SELECT 1 FROM staff s
      WHERE s.dial_code = NEW.dial_code AND s.phone = NEW.phone
    ) THEN
      RAISE EXCEPTION 'phone_in_use' USING ERRCODE = '23505';
    END IF;
  ELSIF TG_TABLE_NAME = 'staff' THEN
    IF EXISTS (
      SELECT 1 FROM members m
      WHERE m.dial_code = NEW.dial_code AND m.phone = NEW.phone
    ) THEN
      RAISE EXCEPTION 'phone_in_use' USING ERRCODE = '23505';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS members_phone_cross_check ON members;
CREATE TRIGGER members_phone_cross_check
  BEFORE INSERT OR UPDATE OF dial_code, phone ON members
  FOR EACH ROW EXECUTE PROCEDURE bold_phone_cross_table_check();

DROP TRIGGER IF EXISTS staff_phone_cross_check ON staff;
CREATE TRIGGER staff_phone_cross_check
  BEFORE INSERT OR UPDATE OF dial_code, phone ON staff
  FOR EACH ROW EXECUTE PROCEDURE bold_phone_cross_table_check();

-- Migrate legacy users (if present from 001_init)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    INSERT INTO staff (id, dial_code, phone, password_hash, surname, given_name, email, role, created_at)
    SELECT id, dial_code, phone, password_hash, '', '', '', 'admin', created_at
    FROM users WHERE role = 'admin'
    ON CONFLICT (dial_code, phone) DO NOTHING;

    INSERT INTO members (
      id, dial_code, phone, password_hash, surname, given_name, email, created_at
    )
    SELECT id, dial_code, phone, password_hash, '', '', '', created_at
    FROM users WHERE role <> 'admin'
    ON CONFLICT (dial_code, phone) DO NOTHING;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'user_id'
    ) THEN
      UPDATE bookings b
      SET user_id = NULL
      WHERE user_id IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM members m WHERE m.id = b.user_id);

      ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;
      ALTER TABLE bookings RENAME COLUMN user_id TO member_id;
      ALTER TABLE bookings
        ADD CONSTRAINT bookings_member_id_fkey
        FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE SET NULL;
    END IF;

    DROP TABLE users;
  END IF;
END $$;