const { Router } = require("express");
const ctrl = require("../controllers/conversationController");

const router = Router();

// GET  /api/conversations/:workflowId  — fetch (or auto-create) conversation
router.get("/:workflowId", ctrl.getByWorkflow);

// POST /api/conversations/:conversationId/participants — add participant
router.post("/:conversationId/participants", ctrl.addParticipant);

module.exports = router;
