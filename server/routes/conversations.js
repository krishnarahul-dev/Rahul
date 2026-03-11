const { Router } = require("express");
const ctrl = require("../controllers/conversationController");

const router = Router();

/*
GET /api/conversations/:workflowId
Fetch existing conversation for a workflow.
If it does not exist, controller will create it.
*/
router.get("/:workflowId", ctrl.getByWorkflow);

/*
POST /api/conversations/:conversationId/participants
Body:
{
  "cflow_id": "cflow_1001",
  "name": "User Name",
  "email": "user@email.com"
}
Adds a participant to the conversation.
*/
router.post("/:conversationId/participants", ctrl.addParticipant);

module.exports = router;