const db = require("../config/db");

const User = {
  async upsert({ cflow_id, name, email, avatar_url }) {
    const { rows } = await db.query(
      `INSERT INTO users (cflow_id, name, email, avatar_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (cflow_id) DO UPDATE
         SET name       = EXCLUDED.name,
             email      = EXCLUDED.email,
             avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url)
       RETURNING *`,
      [cflow_id, name, email, avatar_url || null]
    );
    return rows[0];
  },

  async findById(id) {
    const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    return rows[0] || null;
  },

  async findByCflowId(cflowId) {
    const { rows } = await db.query("SELECT * FROM users WHERE cflow_id = $1", [cflowId]);
    return rows[0] || null;
  },

  async search(query, limit = 20) {
    const { rows } = await db.query(
      `SELECT id, cflow_id, name, email, avatar_url, status, last_seen
       FROM users
       WHERE name ILIKE $1 OR email ILIKE $1
       ORDER BY name
       LIMIT $2`,
      [`%${query}%`, limit]
    );
    return rows;
  },

  async listAll() {
    const { rows } = await db.query(
      `SELECT id, cflow_id, name, email, avatar_url, status, last_seen
       FROM users ORDER BY name`
    );
    return rows;
  },

  async setStatus(userId, status) {
    await db.query(
      `UPDATE users SET status = $2, last_seen = NOW() WHERE id = $1`,
      [userId, status]
    );
  },

  async getByConversation(conversationId) {
    const { rows } = await db.query(
      `SELECT u.id, u.cflow_id, u.name, u.email, u.avatar_url, u.status, u.last_seen,
              cp.role, cp.last_read_at, cp.muted
       FROM users u
       JOIN conversation_participants cp ON cp.user_id = u.id
       WHERE cp.conversation_id = $1
       ORDER BY u.name`,
      [conversationId]
    );
    return rows;
  },
};

module.exports = User;
