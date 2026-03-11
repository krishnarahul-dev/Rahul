const { Router } = require("express");
const ctrl = require("../controllers/userController");

const router = Router();

// POST /api/users       — upsert (sync from Cflow)
router.post("/", ctrl.upsert);

// GET  /api/users/search?q=  — @mention autocomplete
router.get("/search", ctrl.search);

module.exports = router;
