const Conversation = require("../models/Conversation");
const User = require("../models/User");

exports.getByWorkflow = async (req, res) => {
  try {
    const { workflowId } = req.params;

    console.log("[ConversationCtrl] getByWorkflow workflowId =", workflowId);

    if (!workflowId) {
      return res.status(400).json({ error: "workflowId is required." });
    }

    let convo = await Conversation.findByWorkflowId(workflowId);

    if (!convo) {
      convo = await Conversation.getOrCreate(workflowId);
    }

    if (!convo || !convo.id) {
      return res.status(500).json({ error: "Conversation could not be created." });
    }

    const participants = await User.getByConversation(convo.id);

    return res.json({
      ...convo,
      participants: participants || [],
    });
  } catch (err) {
    console.error("[ConversationCtrl] getByWorkflow error:", err);
    return res.status(500).json({ error: "Failed to fetch conversation." });
  }
};

exports.addParticipant = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { user_id } = req.body;

    console.log(
      "[ConversationCtrl] addParticipant conversationId =",
      conversationId,
      "user_id =",
      user_id
    );

    if (!conversationId) {
      return res.status(400).json({ error: "conversationId is required." });
    }

    if (!user_id) {
      return res.status(400).json({ error: "user_id is required." });
    }

    await Conversation.addParticipant(conversationId, user_id);

    return res.json({ success: true });
  } catch (err) {
    console.error("[ConversationCtrl] addParticipant error:", err);
    return res.status(500).json({ error: "Failed to add participant." });
  }
};