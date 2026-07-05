const router = require("express").Router();
// router.use(authMiddleware);
const authMiddleware = require("../middlewares/authMiddleware");
const { createChronicle } = require("../controllers/chronicleController");
const { getChronicles } = require("../controllers/chronicleController");
const { getChronicleById } = require("../controllers/chronicleController");
const { updateChronicleById } = require("../controllers/chronicleController");
const { deleteChronicleById } = require("../controllers/chronicleController");

router.post("/", authMiddleware, createChronicle);
router.get("/getChronicles", authMiddleware, getChronicles);
router.get("/:id", authMiddleware, getChronicleById);
router.put("/:id", authMiddleware, updateChronicleById);
router.delete("/:id", authMiddleware, deleteChronicleById);

module.exports = router;
