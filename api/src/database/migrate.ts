import "dotenv/config";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { getPool, closePool } from "./pool";

async function main() {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  const dir = join(__dirname, "../../db/migrations");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    const { rows } = await pool.query(`SELECT 1 FROM schema_migrations WHERE filename = $1`, [file]);
    if (rows.length > 0) continue;
    const sql = readFileSync(join(dir, file), "utf8");
    await pool.query("BEGIN");
    try {
      await pool.query(sql);
      await pool.query(`INSERT INTO schema_migrations (filename) VALUES ($1)`, [file]);
      await pool.query("COMMIT");
      console.log(`Applied ${file}`);
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    }
  }
  await closePool();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});