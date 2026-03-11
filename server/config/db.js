/**
 * PostgreSQL connection pool (node-pg)
 * ─────────────────────────────────────
 * Exports a shared Pool instance used by every model / controller.
 */
const { Pool } = require("pg");

const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || "cflow_chat",
  user:     process.env.DB_USER     || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  max:      20,
  idleTimeoutMillis: 30_000,
});

pool.on("error", (err) => {
  console.error("[DB] Unexpected pool error:", err.message);
});

module.exports = pool;
