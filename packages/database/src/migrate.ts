import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "pg";
import { loadEnvironment } from "../../config/src/index.js";
const environment = loadEnvironment();
const client = new Client({ connectionString: environment.DATABASE_URL });
await client.connect();
try { await client.query("CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())"); const name = "001_initial_foundation.sql"; const applied = await client.query("SELECT 1 FROM schema_migrations WHERE name = $1", [name]); if (applied.rowCount === 0) { const sql = await readFile(join(dirname(fileURLToPath(import.meta.url)), "migrations", name), "utf8"); await client.query("BEGIN"); await client.query(sql); await client.query("INSERT INTO schema_migrations(name) VALUES ($1)", [name]); await client.query("COMMIT"); console.info(`Applied ${name}`); } else console.info(`${name} already applied`); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { await client.end(); }
