/**
 * Socket.io v2 — backward compatible with v1 workflow rooms
 * + v2 presence, per-user rooms, per-conversation rooms
 */
const Message = require("./models/Message");
const Conversation = require("./models/Conversation");
const User = require("./models/User");

const userSockets = new Map(); // userId → Set<socketId>

function registerSocket(io) {
  io.on("connection", (socket) => {
    console.log(`[WS] Connected: ${socket.id}`);

    // ── V1: join_workflow (backward compatible) ─────────
    socket.on("join_workflow", async (payload) => {
      try {
        const { workflow_id, user } = payload;
        if (!workflow_id || !user?.cflow_id) return;

        const dbUser = await User.upsert(user);
        const convo = await Conversation.getOrCreate(workflow_id);
        await Conversation.addParticipant(convo.id, dbUser.id);

        socket.join(workflow_id);
        socket.join(`conv:${convo.id}`);
        socket.join(`user:${dbUser.id}`);
        socket.data = { user: dbUser, workflow_id, conversation_id: convo.id };

        // Track for presence
        if (!userSockets.has(dbUser.id)) userSockets.set(dbUser.id, new Set());
        userSockets.get(dbUser.id).add(socket.id);
        await User.setStatus(dbUser.id, "online");
        io.emit("presence_change", { user_id: dbUser.id, status: "online" });

        console.log(`[WS] ${dbUser.name} joined workflow room ${workflow_id}`);

        socket.to(workflow_id).emit("user_joined", {
          user: { id: dbUser.id, name: dbUser.name },
          workflow_id,
        });
      } catch (err) {
        console.error("[WS] join_workflow error:", err.message);
        socket.emit("error_event", { message: "Failed to join workflow room." });
      }
    });

    // ── V2: authenticate (for full chat layout) ─────────
    socket.on("authenticate", async (payload) => {
      try {
        const { user } = payload;
        if (!user?.cflow_id) return;

        const dbUser = await User.upsert(user);
        socket.data = { user: dbUser };
        socket.join(`user:${dbUser.id}`);

        if (!userSockets.has(dbUser.id)) userSockets.set(dbUser.id, new Set());
        userSockets.get(dbUser.id).add(socket.id);

        await User.setStatus(dbUser.id, "online");
        io.emit("presence_change", { user_id: dbUser.id, status: "online" });

        // Auto-join all conversations
        const conversations = await Conversation.listForUser(dbUser.id);
        for (const conv of conversations) {
          socket.join(`conv:${conv.id}`);
          // Also join v1 workflow room for backward compat
          if (conv.workflow_id) socket.join(conv.workflow_id);
        }

        socket.emit("authenticated", {
          user: dbUser,
          conversations: conversations.map((c) => c.id),
        });

        console.log(`[WS] ${dbUser.name} authenticated (${conversations.length} convos)`);
      } catch (err) {
        console.error("[WS] authenticate error:", err.message);
        socket.emit("error_event", { message: "Authentication failed." });
      }
    });

    // ── V2: join a specific conversation ────────────────
    socket.on("join_conversation", async ({ conversation_id }) => {
      try {
        const { user } = socket.data || {};
        if (!user || !conversation_id) return;
        socket.join(`conv:${conversation_id}`);
        await Conversation.markRead(conversation_id, user.id);
      } catch (err) {
        console.error("[WS] join_conversation error:", err.message);
      }
    });

    // ── send_message (works for both v1 and v2) ─────────
    socket.on("send_message", async (payload) => {
      try {
        const { message, conversation_id } = payload;
        const { user, workflow_id, conversation_id: v1ConvId } = socket.data || {};
        if (!user || !message?.trim()) return;

        const convId = conversation_id || v1ConvId;
        if (!convId) return;

        const saved = await Message.create({
          conversationId: convId,
          senderId: user.id,
          message: message.trim(),
        });

        // Broadcast to v2 room
        io.to(`conv:${convId}`).emit("receive_message", saved);

        // Also broadcast to v1 workflow room if applicable
        if (workflow_id) {
          io.to(workflow_id).emit("receive_message", saved);
        }

        // Unread notifications for other participants
        const convo = await Conversation.findById(convId);
        if (convo) {
          const parts = await User.getByConversation(convId);
          for (const p of parts) {
            if (p.id !== user.id) {
              io.to(`user:${p.id}`).emit("unread_update", { conversation_id: convId });
            }
          }
          for (const mention of saved.mentions || []) {
            io.to(`user:${mention.user_id}`).emit("mentioned", { conversation_id: convId, message: saved });
          }
        }
      } catch (err) {
        console.error("[WS] send_message error:", err.message);
        socket.emit("error_event", { message: "Failed to send message." });
      }
    });

    // ── mark_read (v2) ──────────────────────────────────
    socket.on("mark_read", async ({ conversation_id }) => {
      try {
        const { user } = socket.data || {};
        if (!user || !conversation_id) return;
        await Conversation.markRead(conversation_id, user.id);
      } catch (err) {
        console.error("[WS] mark_read error:", err.message);
      }
    });

    // ── typing (works for both v1 and v2) ───────────────
    socket.on("typing", (payload) => {
      const { user, workflow_id } = socket.data || {};
      if (!user) return;
      const convId = payload?.conversation_id;

      if (convId) {
        socket.to(`conv:${convId}`).emit("user_typing", { conversation_id: convId, user_id: user.id, name: user.name });
      }
      if (workflow_id) {
        socket.to(workflow_id).emit("user_typing", { user_id: user.id, name: user.name });
      }
    });

    socket.on("stop_typing", (payload) => {
      const { user, workflow_id } = socket.data || {};
      if (!user) return;
      const convId = payload?.conversation_id;

      if (convId) {
        socket.to(`conv:${convId}`).emit("user_stop_typing", { conversation_id: convId, user_id: user.id });
      }
      if (workflow_id) {
        socket.to(workflow_id).emit("user_stop_typing", { user_id: user.id });
      }
    });

    // ── disconnect ──────────────────────────────────────
    socket.on("disconnect", async () => {
      const { user, workflow_id } = socket.data || {};
      if (!user) return;

      // V1 compat
      if (workflow_id) {
        socket.to(workflow_id).emit("user_left", {
          user: { id: user.id, name: user.name },
          workflow_id,
        });
      }

      // Presence
      const sockets = userSockets.get(user.id);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(user.id);
          await User.setStatus(user.id, "offline");
          io.emit("presence_change", { user_id: user.id, status: "offline" });
          console.log(`[WS] ${user.name} went offline`);
        }
      }
    });
  });
}

module.exports = registerSocket;
