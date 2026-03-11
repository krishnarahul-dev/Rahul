const db = require("../config/db");

const MENTION_REGEX = /@(\w[\w. ]*?)(?=\s|$|[,;:!?)])/g;

const Message = {
  /**
   * Persist a message and any @mentions found within it.
   * Returns the full message row joined with sender info.
   */
  async create({ conversationId, senderId, message }) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      // 1. Insert message
      const { rows } = await client.query(
        `INSERT INTO messages (conversation_id, sender_id, message)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [conversationId, senderId, message]
      );
      const msg = rows[0];

      // 2. Extract @mentions and resolve to user IDs
      const mentionNames = [];
      let match;
      while ((match = MENTION_REGEX.exec(message)) !== null) {
        mentionNames.push(match[1].trim());
      }

      const mentions = [];
      for (const name of mentionNames) {
        const res = await client.query(
          "SELECT id FROM users WHERE name ILIKE $1 LIMIT 1",
          [name]
        );
        if (res.rows.length) {
          const userId = res.rows[0].id;
          await client.query(
            `INSERT INTO message_mentions (message_id, user_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [msg.id, userId]
          );
          mentions.push({ user_id: userId, name });
        }
      }

      await client.query("COMMIT");

      // 3. Attach sender details
      const sender = await client.query(
        "SELECT id, cflow_id, name, email, avatar_url FROM users WHERE id = $1",
        [senderId]
      );

      return {
        ...msg,
        sender: sender.rows[0] || null,
        mentions,
      };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  /** Fetch all messages for a conversation, newest last. */
  async getByConversation(conversationId, { limit = 100, offset = 0 } = {}) {
    const { rows } = await db.query(
      `SELECT
         m.*,
         json_build_object(
           'id',    u.id,
           'name',  u.name,
           'email', u.email,
           'avatar_url', u.avatar_url
         ) AS sender
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC
       LIMIT $2 OFFSET $3`,
      [conversationId, limit, offset]
    );
    return rows;
  },

  /** Get mentions for a specific message. */
  async getMentions(messageId) {
    const { rows } = await db.query(
      `SELECT u.id, u.name, u.email
       FROM message_mentions mm
       JOIN users u ON u.id = mm.user_id
       WHERE mm.message_id = $1`,
      [messageId]
    );
    return rows;
  },

  /** Get all messages where a user was mentioned (notification feed). */
  async getMentionsForUser(userId, { limit = 50, offset = 0 } = {}) {
    const { rows } = await db.query(
      `SELECT m.*, c.workflow_id,
         json_build_object('id', u.id, 'name', u.name) AS sender
       FROM message_mentions mm
       JOIN messages m      ON m.id  = mm.message_id
       JOIN users u         ON u.id  = m.sender_id
       JOIN conversations c ON c.id  = m.conversation_id
       WHERE mm.user_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return rows;
  },
};

module.exports = Message;
