/**
 * Socket.io real-time messaging layer
 * ────────────────────────────────────
 * Each workflow request maps to a Socket.io "room".
 * Clients join a room by emitting `join_workflow` with the workflow_id.
 * Messages are broadcast to the room via `receive_message`.
 */
const Message = require("./models/Message");
const Conversation = require("./models/Conversation");
const User = require("./models/User");

function registerSocket(io) {
  io.on("connection", (socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);

    /**
     * join_workflow — called when a user opens a workflow chat panel.
     * Payload: { workflow_id, user: { cflow_id, name, email } }
     */
    socket.on("join_workflow", async (payload) => {
      try {
        const { workflow_id, user } = payload;
        if (!workflow_id || !user?.cflow_id) return;

        // Upsert user so we always have a local record
        const dbUser = await User.upsert(user);

        // Ensure conversation exists
        const convo = await Conversation.getOrCreate(workflow_id);

        // Add as participant
        await Conversation.addParticipant(convo.id, dbUser.id);

        // Join the Socket.io room keyed by workflow_id
        socket.join(workflow_id);

        // Attach metadata to socket for later use
        socket.data = { user: dbUser, workflow_id, conversation_id: convo.id };

        console.log(`[WS] ${dbUser.name} joined room ${workflow_id}`);

        // Notify others
        socket.to(workflow_id).emit("user_joined", {
          user: { id: dbUser.id, name: dbUser.name },
          workflow_id,
        });
      } catch (err) {
        console.error("[WS] join_workflow error:", err.message);
        socket.emit("error_event", { message: "Failed to join workflow room." });
      }
    });

    /**
     * send_message — persist + broadcast a new chat message.
     * Payload: { message: string }
     */
    socket.on("send_message", async (payload) => {
      try {
        const { message } = payload;
        const { user, workflow_id, conversation_id } = socket.data || {};

        if (!user || !conversation_id || !message?.trim()) return;

        const saved = await Message.create({
          conversationId: conversation_id,
          senderId: user.id,
          message: message.trim(),
        });

        // Broadcast to everyone in the room (including sender)
        io.to(workflow_id).emit("receive_message", saved);
      } catch (err) {
        console.error("[WS] send_message error:", err.message);
        socket.emit("error_event", { message: "Failed to send message." });
      }
    });

    /**
     * typing — ephemeral typing indicator.
     */
    socket.on("typing", () => {
      const { user, workflow_id } = socket.data || {};
      if (!user || !workflow_id) return;
      socket.to(workflow_id).emit("user_typing", {
        user_id: user.id,
        name: user.name,
      });
    });

    socket.on("stop_typing", () => {
      const { user, workflow_id } = socket.data || {};
      if (!user || !workflow_id) return;
      socket.to(workflow_id).emit("user_stop_typing", {
        user_id: user.id,
      });
    });

    socket.on("disconnect", () => {
      const { user, workflow_id } = socket.data || {};
      if (user && workflow_id) {
        socket.to(workflow_id).emit("user_left", {
          user: { id: user.id, name: user.name },
          workflow_id,
        });
        console.log(`[WS] ${user.name} left room ${workflow_id}`);
      }
    });
  });
}

module.exports = registerSocket;
