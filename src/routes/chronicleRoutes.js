const router = require("express").Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
  createChronicle,
  getChronicles,
  getChronicleById,
  updateChronicleById,
  deleteChronicleById,
} = require("../controllers/chronicleController");

router.post("/", authMiddleware, createChronicle);
router.get("/getchronicles", authMiddleware, getChronicles);
router.get("/:id", authMiddleware, getChronicleById);
router.patch("/:id", authMiddleware, updateChronicleById);
router.delete("/:id", authMiddleware, deleteChronicleById);

module.exports = router;
