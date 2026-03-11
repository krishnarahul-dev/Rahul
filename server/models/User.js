const db = require("../config/db");

const User = {
  async upsert({ cflow_id, name, email }) {
    const { rows } = await db.query(
      `INSERT INTO users (cflow_id, name, email)
       VALUES ($1, $2, $3)
       ON CONFLICT (cflow_id) DO UPDATE
         SET name  = EXCLUDED.name,
             email = EXCLUDED.email
       RETURNING *`,
      [cflow_id, name, email]
    );
    return rows[0];
  },

  async findById(id) {
    const { rows } = await db.query(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );
    return rows[0] || null;
  },

  async findByCflowId(cflowId) {
    const { rows } = await db.query(
      "SELECT * FROM users WHERE cflow_id = $1",
      [cflowId]
    );
    return rows[0] || null;
  },

  async search(query, limit = 10) {
    const { rows } = await db.query(
      `SELECT id, cflow_id, name, email
       FROM users
       WHERE name ILIKE $1
       ORDER BY name
       LIMIT $2`,
      [`${query}%`, limit]
    );
    return rows;
  },

  async getByConversation(conversationId) {
    const { rows } = await db.query(
      `SELECT u.id, u.cflow_id, u.name, u.email
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