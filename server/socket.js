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
     * join_workflow
     * Payload:
     * {
     *   workflow_id: string,
     *   user: { cflow_id, name, email }
     * }
     */
    socket.on("join_workflow", async (payload) => {
      try {

        const { workflow_id, user } = payload || {};

        if (!workflow_id) return;
        if (!user) return;
        if (!user.cflow_id) return;

        /* ─────────────────────────────
           Ensure local user record
        ───────────────────────────── */

        const dbUser = await User.upsert({
          cflow_id: user.cflow_id,
          name: user.name || "Unknown",
          email: user.email || null
        });

        /* ─────────────────────────────
           Ensure conversation exists
        ───────────────────────────── */

        const conversation = await Conversation.getOrCreate(workflow_id);

        /* ─────────────────────────────
           Attach participant
        ───────────────────────────── */

        await Conversation.addParticipant(
          conversation.id,
          dbUser.id
        );

        /* ─────────────────────────────
           Join workflow room
        ───────────────────────────── */

        socket.join(workflow_id);

        /* ─────────────────────────────
           Attach socket metadata
        ───────────────────────────── */

        socket.data = {
          user: dbUser,
          workflow_id,
          conversation_id: conversation.id
        };

        console.log(`[WS] ${dbUser.name} joined room ${workflow_id}`);

        /* ─────────────────────────────
           Notify others
        ───────────────────────────── */

        socket.to(workflow_id).emit("user_joined", {
          user: {
            id: dbUser.id,
            name: dbUser.name
          },
          workflow_id
        });

      } catch (err) {

        console.error("[WS] join_workflow error:", err);

        socket.emit("error_event", {
          message: "Failed to join workflow room"
        });

      }
    });


    /**
     * send_message
     * Payload:
     * { message: string }
     */

    socket.on("send_message", async (payload) => {

      try {

        const messageText = payload?.message?.trim();

        const { user, workflow_id, conversation_id } = socket.data || {};

        if (!messageText) return;
        if (!user) return;
        if (!conversation_id) return;

        const savedMessage = await Message.create({
          conversationId: conversation_id,
          senderId: user.id,
          message: messageText
        });

        io.to(workflow_id).emit("receive_message", savedMessage);

      } catch (err) {

        console.error("[WS] send_message error:", err);

        socket.emit("error_event", {
          message: "Failed to send message"
        });

      }

    });


    /**
     * typing indicator
     */

    socket.on("typing", () => {

      const { user, workflow_id } = socket.data || {};

      if (!user) return;
      if (!workflow_id) return;

      socket.to(workflow_id).emit("user_typing", {
        user_id: user.id,
        name: user.name
      });

    });


    socket.on("stop_typing", () => {

      const { user, workflow_id } = socket.data || {};

      if (!user) return;
      if (!workflow_id) return;

      socket.to(workflow_id).emit("user_stop_typing", {
        user_id: user.id
      });

    });


    /**
     * disconnect
     */

    socket.on("disconnect", () => {

      const { user, workflow_id } = socket.data || {};

      if (!user) return;
      if (!workflow_id) return;

      socket.to(workflow_id).emit("user_left", {
        user: {
          id: user.id,
          name: user.name
        },
        workflow_id
      });

      console.log(`[WS] ${user.name} left room ${workflow_id}`);

    });

  });

}

module.exports = registerSocket;