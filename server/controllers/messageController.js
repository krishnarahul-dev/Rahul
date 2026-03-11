const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

exports.send = async (req, res) => {
  try {
    const { conversation_id, sender_id, message } = req.body;

    if (!conversation_id || !sender_id || !message?.trim()) {
      return res.status(400).json({
        error: "conversation_id, sender_id, and message are required.",
      });
    }

    const convo = await Conversation.findById(conversation_id);
    if (!convo) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    const msg = await Message.create({
      conversationId: conversation_id,
      senderId: sender_id,
      message: message.trim(),
    });

    // Emit via Socket.io if the io instance is attached to the app
    const io = req.app.get("io");
    if (io) {
      io.to(convo.workflow_id).emit("receive_message", msg);
    }

    return res.status(201).json(msg);
  } catch (err) {
    console.error("[MessageCtrl] send:", err.message);
    return res.status(500).json({ error: "Failed to send message." });
  }
};

exports.getByConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const limit  = Math.min(Number(req.query.limit)  || 100, 500);
    const offset = Number(req.query.offset) || 0;

    const messages = await Message.getByConversation(conversationId, { limit, offset });

    return res.json(messages);
  } catch (err) {
    console.error("[MessageCtrl] getByConversation:", err.message);
    return res.status(500).json({ error: "Failed to fetch messages." });
  }
};

exports.getMentions = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit  = Math.min(Number(req.query.limit)  || 50, 200);
    const offset = Number(req.query.offset) || 0;

    const mentions = await Message.getMentionsForUser(userId, { limit, offset });

    return res.json(mentions);
  } catch (err) {
    console.error("[MessageCtrl] getMentions:", err.message);
    return res.status(500).json({ error: "Failed to fetch mentions." });
  }
};
