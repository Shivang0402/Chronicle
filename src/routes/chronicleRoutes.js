const router = require("express").Router();
// router.use(authMiddleware);
const authMiddleware = require("../middlewares/authMiddleware");
const { createChronicle } = require("../controllers/chronicleController");
const { getChronicles } = require("../controllers/chronicleController");
const { getChronicleById } = require("../controllers/chronicleController");

router.post("/", authMiddleware, createChronicle);
router.get("/getChronicles", authMiddleware, getChronicles);
router.get("/:id", authMiddleware, getChronicleById);
// router.put("/:id", updateChronicle);
// router.delete("/:id", deleteChronicle);

module.exports = router;
