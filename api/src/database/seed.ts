import "dotenv/config";
import { getPool, closePool } from "./pool";
import { defaultSiteContentPayload, defaultFacilityPayload, catalogRows } from "./seed-data";

const ADMIN_HASH = "$2b$10$vVoEShkFoDeZj4sxVAYTyOPqYjm63BpAk4TGBZ81/bv/OyRyU2qPy";

function offsetDate(days: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const pool = getPool();

  for (let id = 1; id <= 8; id++) {
    await pool.query(
      `INSERT INTO courts (id, in_maintenance) VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET in_maintenance = EXCLUDED.in_maintenance`,
      [id, id === 3],
    );
  }

  await pool.query(
    `INSERT INTO users (dial_code, phone, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (dial_code, phone) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin'`,
    ["852", "88888888", ADMIN_HASH],
  );

  const seedBookings = [
    { id: "demo-bp-1", date: offsetDate(2), time: "18:00", courtId: 5, guest: "Guest" },
    { id: "demo-bp-2", date: offsetDate(5), time: "10:00", courtId: 1, guest: "Guest" },
  ];
  for (const b of seedBookings) {
    await pool.query(
      `INSERT INTO bookings (id, user_id, guest_name, court_id, booking_date, booking_time, status, payment_status)
       VALUES ($1, NULL, $2, $3, $4::date, $5, 'active', 'awaiting_payment')
       ON CONFLICT (id) DO NOTHING`,
      [b.id, b.guest, b.courtId, b.date, b.time],
    );
  }

  await pool.query(
    `INSERT INTO site_content (id, payload) VALUES (1, $1::jsonb)
     ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload`,
    [JSON.stringify(defaultSiteContentPayload)],
  );

  await pool.query(
    `INSERT INTO facility_content (id, payload) VALUES (1, $1::jsonb)
     ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload`,
    [JSON.stringify(defaultFacilityPayload)],
  );

  for (const row of catalogRows) {
    await pool.query(
      `INSERT INTO content_catalog (id, kind, payload) VALUES ($1, $2, $3::jsonb)
       ON CONFLICT (id) DO UPDATE SET kind = EXCLUDED.kind, payload = EXCLUDED.payload`,
      [row.id, row.kind, JSON.stringify(row.payload)],
    );
  }

  console.log("Seed complete (admin +852 88888888 — password in api/README.md)");
  await closePool();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});