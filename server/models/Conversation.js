const db = require("../config/db");

const Conversation = {
  // ── V1 backward-compatible methods (workflow) ───────────

  async getOrCreate(workflowId, title) {
    const existing = await db.query(
      "SELECT * FROM conversations WHERE workflow_id = $1",
      [workflowId]
    );
    if (existing.rows.length) return existing.rows[0];

    const { rows } = await db.query(
      `INSERT INTO conversations (type, workflow_id, name, title)
       VALUES ('workflow', $1, $2, $2) RETURNING *`,
      [workflowId, title || `Workflow #${workflowId}`]
    );
    return rows[0];
  },

  async findById(id) {
    const { rows } = await db.query("SELECT * FROM conversations WHERE id = $1", [id]);
    return rows[0] || null;
  },

  async findByWorkflowId(workflowId) {
    const { rows } = await db.query(
      "SELECT * FROM conversations WHERE workflow_id = $1",
      [workflowId]
    );
    return rows[0] || null;
  },

  async addParticipant(conversationId, userId, role = "member") {
    await db.query(
      `INSERT INTO conversation_participants (conversation_id, user_id, role)
       VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [conversationId, userId, role]
    );
  },

  // ── V2 new methods ─────────────────────────────────────

  /** Find or create a DM between two users. */
  async findOrCreateDirect(userId1, userId2) {
    const existing = await db.query(
      "SELECT find_direct_conversation($1, $2) AS id",
      [userId1, userId2]
    );
    if (existing.rows[0]?.id) {
      return this.findByIdWithDetails(existing.rows[0].id, userId1);
    }

    const client = await db.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query(
        `INSERT INTO conversations (type, created_by) VALUES ('direct', $1) RETURNING *`,
        [userId1]
      );
      const convo = rows[0];
      await client.query(
        `INSERT INTO conversation_participants (conversation_id, user_id) VALUES ($1, $2), ($1, $3)`,
        [convo.id, userId1, userId2]
      );
      await client.query("COMMIT");
      return this.findByIdWithDetails(convo.id, userId1);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  /** Create a group chat. */
  async createGroup({ name, createdBy, memberIds, avatarUrl }) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query(
        `INSERT INTO conversations (type, name, avatar_url, created_by)
         VALUES ('group', $1, $2, $3) RETURNING *`,
        [name, avatarUrl || null, createdBy]
      );
      const convo = rows[0];

      await client.query(
        `INSERT INTO conversation_participants (conversation_id, user_id, role) VALUES ($1, $2, 'admin')`,
        [convo.id, createdBy]
      );

      const unique = [...new Set(memberIds.filter((id) => id !== createdBy))];
      for (const uid of unique) {
        await client.query(
          `INSERT INTO conversation_participants (conversation_id, user_id, role)
           VALUES ($1, $2, 'member') ON CONFLICT DO NOTHING`,
          [convo.id, uid]
        );
      }

      await client.query(
        `INSERT INTO messages (conversation_id, sender_id, type, message)
         VALUES ($1, $2, 'system', 'created this group')`,
        [convo.id, createdBy]
      );

      await client.query("COMMIT");
      return this.findByIdWithDetails(convo.id, createdBy);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  /** Get conversation with participants, last message, and unread count. */
  async findByIdWithDetails(id, currentUserId) {
    const { rows } = await db.query(
      `SELECT c.*,
        (SELECT COUNT(*)::int FROM messages m
         WHERE m.conversation_id = c.id
           AND m.created_at > COALESCE(
             (SELECT last_read_at FROM conversation_participants
              WHERE conversation_id = c.id AND user_id = $2), c.created_at)
        ) AS unread_count
       FROM conversations c WHERE c.id = $1`,
      [id, currentUserId]
    );
    if (!rows.length) return null;
    const convo = rows[0];

    const parts = await db.query(
      `SELECT u.id, u.cflow_id, u.name, u.email, u.avatar_url, u.status, cp.role, cp.muted
       FROM users u JOIN conversation_participants cp ON cp.user_id = u.id
       WHERE cp.conversation_id = $1 ORDER BY u.name`,
      [id]
    );
    convo.participants = parts.rows;

    const lastMsg = await db.query(
      `SELECT m.*, json_build_object('id', u.id, 'name', u.name) AS sender
       FROM messages m JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = $1 ORDER BY m.created_at DESC LIMIT 1`,
      [id]
    );
    convo.last_message = lastMsg.rows[0] || null;

    return convo;
  },

  /** List ALL conversations for a user with unread counts and last message. */
  async listForUser(userId, { type, limit = 50, offset = 0 } = {}) {
    let typeFilter = "";
    const params = [userId, limit, offset];
    if (type) {
      typeFilter = "AND c.type = $4";
      params.push(type);
    }

    const { rows } = await db.query(
      `SELECT c.*,
         (SELECT COUNT(*)::int FROM messages m
          WHERE m.conversation_id = c.id AND m.created_at > cp.last_read_at
         ) AS unread_count,
         (SELECT json_build_object(
           'id', m.id, 'message', m.message, 'type', m.type,
           'created_at', m.created_at,
           'sender', json_build_object('id', u2.id, 'name', u2.name)
         ) FROM messages m JOIN users u2 ON u2.id = m.sender_id
         WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1
         ) AS last_message,
         (SELECT json_agg(json_build_object(
           'id', u3.id, 'name', u3.name, 'email', u3.email,
           'avatar_url', u3.avatar_url, 'status', u3.status, 'role', cp2.role
         ) ORDER BY u3.name)
         FROM users u3 JOIN conversation_participants cp2 ON cp2.user_id = u3.id
         WHERE cp2.conversation_id = c.id
         ) AS participants
       FROM conversations c
       JOIN conversation_participants cp ON cp.conversation_id = c.id AND cp.user_id = $1
       WHERE 1=1 ${typeFilter}
       ORDER BY c.updated_at DESC
       LIMIT $2 OFFSET $3`,
      params
    );
    return rows;
  },

  async markRead(conversationId, userId) {
    await db.query(
      `UPDATE conversation_participants SET last_read_at = NOW()
       WHERE conversation_id = $1 AND user_id = $2`,
      [conversationId, userId]
    );
  },

  async removeParticipant(conversationId, userId) {
    await db.query(
      `DELETE FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2`,
      [conversationId, userId]
    );
  },

  async updateGroup(conversationId, { name, avatarUrl }) {
    const sets = [];
    const params = [conversationId];
    let idx = 2;
    if (name !== undefined) { sets.push(`name = $${idx++}`); params.push(name); }
    if (avatarUrl !== undefined) { sets.push(`avatar_url = $${idx++}`); params.push(avatarUrl); }
    if (!sets.length) return;
    await db.query(`UPDATE conversations SET ${sets.join(", ")} WHERE id = $1`, params);
  },

  async getTotalUnread(userId) {
    const { rows } = await db.query(
      `SELECT COALESCE(SUM(
         (SELECT COUNT(*) FROM messages m
          WHERE m.conversation_id = cp.conversation_id AND m.created_at > cp.last_read_at)
       ), 0)::int AS total_unread
       FROM conversation_participants cp
       WHERE cp.user_id = $1 AND cp.muted = false`,
      [userId]
    );
    return rows[0]?.total_unread || 0;
  },
};

module.exports = Conversation;
