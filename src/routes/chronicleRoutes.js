const router = require("express").Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
  createChronicle,
  getChronicles,
  getChronicleById,
  updateChronicleById,
  deleteChronicleById,
  searchChronicle,
  getMoods,
  getTags,
  getChronicleStats,
} = require("../controllers/chronicleController");

router.get("/stats", authMiddleware, getChronicleStats);
router.get("/search", authMiddleware, searchChronicle);
router.get("/moods", authMiddleware, getMoods);
router.get("/tags", authMiddleware, getTags);
router.post("/", authMiddleware, createChronicle);
router.get("/getchronicles", authMiddleware, getChronicles);
router.get("/:id", authMiddleware, getChronicleById);
router.patch("/:id", authMiddleware, updateChronicleById);
router.delete("/:id", authMiddleware, deleteChronicleById);

module.exports = router;
