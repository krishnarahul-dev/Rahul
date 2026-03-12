const Conversation = require("../models/Conversation");
const User = require("../models/User");

/**
 * GET /api/conversations/:workflowId  (V1 backward compatible)
 * Also handles: GET /api/conversations?type=...&user_id=...
 */
exports.getByWorkflow = async (req, res) => {
  try {
    const { workflowId } = req.params;
    if (!workflowId) return res.status(400).json({ error: "workflowId is required." });

    let convo = await Conversation.findByWorkflowId(workflowId);
    if (!convo) convo = await Conversation.getOrCreate(workflowId);
    if (!convo?.id) return res.status(500).json({ error: "Conversation could not be created." });

    const participants = await User.getByConversation(convo.id);
    return res.json({ ...convo, participants: participants || [] });
  } catch (err) {
    console.error("[ConvCtrl] getByWorkflow:", err);
    return res.status(500).json({ error: "Failed to fetch conversation." });
  }
};

exports.addParticipant = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { user_id } = req.body;
    if (!conversationId) return res.status(400).json({ error: "conversationId is required." });
    if (!user_id) return res.status(400).json({ error: "user_id is required." });

    await Conversation.addParticipant(conversationId, user_id);

    const io = req.app.get("io");
    if (io) {
      io.to(`conv:${conversationId}`).emit("participant_added", { conversation_id: conversationId, user_id });
      io.to(`user:${user_id}`).emit("added_to_conversation", { conversation_id: conversationId });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("[ConvCtrl] addParticipant:", err);
    return res.status(500).json({ error: "Failed to add participant." });
  }
};

// ── V2 endpoints ────────────────────────────────────────

/** GET /api/conversations/v2/list?type=&user_id= */
exports.list = async (req, res) => {
  try {
    const userId = req.query.user_id || req.headers["x-user-id"];
    if (!userId) return res.status(400).json({ error: "user_id query param or x-user-id header required." });

    const { type, limit, offset } = req.query;
    const conversations = await Conversation.listForUser(userId, {
      type: type || undefined,
      limit: Number(limit) || 50,
      offset: Number(offset) || 0,
    });
    return res.json(conversations);
  } catch (err) {
    console.error("[ConvCtrl] list:", err.message);
    return res.status(500).json({ error: "Failed to list conversations." });
  }
};

/** GET /api/conversations/v2/unread?user_id= */
exports.unreadCount = async (req, res) => {
  try {
    const userId = req.query.user_id || req.headers["x-user-id"];
    if (!userId) return res.status(400).json({ error: "user_id required." });
    const count = await Conversation.getTotalUnread(userId);
    return res.json({ unread: count });
  } catch (err) {
    console.error("[ConvCtrl] unreadCount:", err.message);
    return res.status(500).json({ error: "Failed to get unread count." });
  }
};

/** POST /api/conversations/v2/direct  Body: { user_id, target_user_id } */
exports.createDirect = async (req, res) => {
  try {
    const { user_id, target_user_id } = req.body;
    if (!user_id || !target_user_id) return res.status(400).json({ error: "user_id and target_user_id required." });
    if (user_id === target_user_id) return res.status(400).json({ error: "Cannot DM yourself." });

    const convo = await Conversation.findOrCreateDirect(user_id, target_user_id);

    const io = req.app.get("io");
    if (io) {
      io.to(`user:${target_user_id}`).emit("conversation_created", convo);
    }

    return res.json(convo);
  } catch (err) {
    console.error("[ConvCtrl] createDirect:", err.message);
    return res.status(500).json({ error: "Failed to create DM." });
  }
};

/** POST /api/conversations/v2/group  Body: { user_id, name, member_ids[] } */
exports.createGroup = async (req, res) => {
  try {
    const { user_id, name, member_ids, avatar_url } = req.body;
    if (!user_id || !name || !member_ids?.length) return res.status(400).json({ error: "user_id, name, member_ids[] required." });

    const convo = await Conversation.createGroup({
      name,
      createdBy: user_id,
      memberIds: member_ids,
      avatarUrl: avatar_url,
    });

    const io = req.app.get("io");
    if (io) {
      for (const p of convo.participants || []) {
        io.to(`user:${p.id}`).emit("conversation_created", convo);
      }
    }

    return res.status(201).json(convo);
  } catch (err) {
    console.error("[ConvCtrl] createGroup:", err.message);
    return res.status(500).json({ error: "Failed to create group." });
  }
};

/** GET /api/conversations/v2/:id?user_id= */
exports.getById = async (req, res) => {
  try {
    const userId = req.query.user_id || req.headers["x-user-id"];
    const convo = await Conversation.findByIdWithDetails(req.params.id, userId);
    if (!convo) return res.status(404).json({ error: "Not found." });
    return res.json(convo);
  } catch (err) {
    console.error("[ConvCtrl] getById:", err.message);
    return res.status(500).json({ error: "Failed." });
  }
};

/** POST /api/conversations/v2/:id/read  Body: { user_id } */
exports.markRead = async (req, res) => {
  try {
    const userId = req.body.user_id || req.headers["x-user-id"];
    await Conversation.markRead(req.params.id, userId);
    return res.json({ success: true });
  } catch (err) {
    console.error("[ConvCtrl] markRead:", err.message);
    return res.status(500).json({ error: "Failed." });
  }
};

/** DELETE /api/conversations/v2/:id/participants/:userId */
exports.removeParticipant = async (req, res) => {
  try {
    await Conversation.removeParticipant(req.params.id, req.params.userId);
    return res.json({ success: true });
  } catch (err) {
    console.error("[ConvCtrl] removeParticipant:", err.message);
    return res.status(500).json({ error: "Failed." });
  }
};
