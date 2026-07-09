const router = require("express").Router();
//router.use(authMiddleware);
const authMiddleware = require("../middlewares/authMiddleware");
const { createChronicle } = require("../controllers/chronicleController");
const { getChronicles } = require("../controllers/chronicleController");
const { getChronicleById } = require("../controllers/chronicleController");
const { updateChronicleById } = require("../controllers/chronicleController");
const { deleteChronicleById } = require("../controllers/chronicleController");
const { searchChronicle } = require("../controllers/chronicleController");
const { getChronicleStats } = require("../controllers/chronicleController");

router.get("/stats", authMiddleware, getChronicleStats);
router.get("/search", authMiddleware, searchChronicle);
router.post("/", authMiddleware, createChronicle);
router.get("/getchronicles", authMiddleware, getChronicles);
router.get("/:id", authMiddleware, getChronicleById);
router.put("/:id", authMiddleware, updateChronicleById);
router.delete("/:id", authMiddleware, deleteChronicleById);

module.exports = router;
