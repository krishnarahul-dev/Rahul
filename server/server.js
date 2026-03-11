/**
 * Cflow Chat — Server Entry Point
 * ────────────────────────────────
 * Express REST API + Socket.io real-time layer.
 */
require("dotenv").config();

const http    = require("http");
const express = require("express");
const cors    = require("cors");
const { Server } = require("socket.io");

const registerSocket = require("./socket");

// ── Express setup ──────────────────────────────────────────
const app  = express();
const server = http.createServer(app);

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// ── Health check ───────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// ── REST routes ────────────────────────────────────────────
app.use("/api/conversations", require("./routes/conversations"));
app.use("/api/messages",      require("./routes/messages"));
app.use("/api/users",         require("./routes/users"));

// ── Socket.io setup ────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
  pingTimeout:  60_000,
  pingInterval: 25_000,
});

// Make io available in controllers (for REST-based message sends)
app.set("io", io);

registerSocket(io);

// ── Start ──────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 4000;

server.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║   Cflow Chat Server                       ║
  ║   REST  →  http://localhost:${PORT}/api     ║
  ║   WS    →  ws://localhost:${PORT}           ║
  ╚═══════════════════════════════════════════╝
  `);
});
