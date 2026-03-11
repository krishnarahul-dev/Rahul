const db = require("../config/db");

const Conversation = {
  /**
   * Get or create a conversation for a workflow request.
   * Ensures exactly one conversation exists per workflow_id.
   */
  async getOrCreate(workflowId, title) {
    const existing = await db.query(
      "SELECT * FROM conversations WHERE workflow_id = $1",
      [workflowId]
    );
    if (existing.rows.length) return existing.rows[0];

    const { rows } = await db.query(
      `INSERT INTO conversations (workflow_id, title)
       VALUES ($1, $2)
       RETURNING *`,
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

  /** Add a user to the conversation if not already present. */
  async addParticipant(conversationId, userId) {
    await db.query(
      `INSERT INTO conversation_participants (conversation_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [conversationId, userId]
    );
  },

  /** List all conversations a user belongs to. */
  async listForUser(userId) {
    const { rows } = await db.query(
      `SELECT c.*
       FROM conversations c
       JOIN conversation_participants cp ON cp.conversation_id = c.id
       WHERE cp.user_id = $1
       ORDER BY c.created_at DESC`,
      [userId]
    );
    return rows;
  },
};

module.exports = Conversation;
