const { Router } = require("express");
const ctrl = require("../controllers/messageController");

const router = Router();

// POST /api/messages           — send a new message
router.post("/", ctrl.send);

// GET  /api/messages/:conversationId  — get all messages in a conversation
router.get("/:conversationId", ctrl.getByConversation);

// GET  /api/messages/mentions/:userId — get mentions for a user
router.get("/mentions/:userId", ctrl.getMentions);

module.exports = router;
