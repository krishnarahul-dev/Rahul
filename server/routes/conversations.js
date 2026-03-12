const { Router } = require("express");
const ctrl = require("../controllers/conversationController");

const router = Router();

// ── V2 routes (must come BEFORE :workflowId to avoid conflicts) ──
router.get("/v2/list",            ctrl.list);
router.get("/v2/unread",          ctrl.unreadCount);
router.post("/v2/direct",         ctrl.createDirect);
router.post("/v2/group",          ctrl.createGroup);
router.get("/v2/:id",             ctrl.getById);
router.post("/v2/:id/read",       ctrl.markRead);
router.delete("/v2/:id/participants/:userId", ctrl.removeParticipant);

// ── V1 backward-compatible routes ──
router.get("/:workflowId",                    ctrl.getByWorkflow);
router.post("/:conversationId/participants",   ctrl.addParticipant);

module.exports = router;
