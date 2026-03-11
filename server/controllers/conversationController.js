const Conversation = require("../models/Conversation");
const User = require("../models/User");

exports.getByWorkflow = async (req, res) => {
  try {
    const { workflowId } = req.params;
    let convo = await Conversation.findByWorkflowId(workflowId);

    if (!convo) {
      convo = await Conversation.getOrCreate(workflowId);
    }

    const participants = await User.getByConversation(convo.id);

    return res.json({ ...convo, participants });
  } catch (err) {
    console.error("[ConversationCtrl] getByWorkflow:", err.message);
    return res.status(500).json({ error: "Failed to fetch conversation." });
  }
};

exports.addParticipant = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "user_id is required." });
    }

    await Conversation.addParticipant(conversationId, user_id);
    return res.json({ success: true });
  } catch (err) {
    console.error("[ConversationCtrl] addParticipant:", err.message);
    return res.status(500).json({ error: "Failed to add participant." });
  }
};
