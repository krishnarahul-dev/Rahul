const { Router } = require("express");
const ctrl = require("../controllers/userController");

const router = Router();

router.post("/",           ctrl.upsert);
router.get("/",            ctrl.listAll);
router.get("/search",      ctrl.search);

module.exports = router;
