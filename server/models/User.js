const db = require("../config/db");

const User = {
  /**
   * Find or create a user from Cflow session data.
   * Called on every socket connection / API hit so the local
   * users table stays in sync with Cflow's user directory.
   */
  async upsert({ cflow_id, name, email, avatar_url }) {
    const { rows } = await db.query(
      `INSERT INTO users (cflow_id, name, email, avatar_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (cflow_id) DO UPDATE
         SET name       = EXCLUDED.name,
             email      = EXCLUDED.email,
             avatar_url = EXCLUDED.avatar_url
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

  /** Search users by name prefix (used for @mention autocomplete). */
  async search(query, limit = 10) {
    const { rows } = await db.query(
      `SELECT id, cflow_id, name, email, avatar_url
       FROM users
       WHERE name ILIKE $1
       ORDER BY name
       LIMIT $2`,
      [`${query}%`, limit]
    );
    return rows;
  },

  /** Get all participants in a conversation. */
  async getByConversation(conversationId) {
    const { rows } = await db.query(
      `SELECT u.id, u.cflow_id, u.name, u.email, u.avatar_url
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
