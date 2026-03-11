/**
 * PostgreSQL connection pool (node-pg)
 * ─────────────────────────────────────
 * Supports both:
 * 1. DATABASE_URL (Render production)
 * 2. individual DB_* vars (local development)
 */
const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
    })
  : new Pool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || "cflow_chat",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      max: 20,
      idleTimeoutMillis: 30000,
    });

pool.on("error", (err) => {
  console.error("[DB] Unexpected pool error:", err);
});

module.exports = pool;