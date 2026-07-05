const router = require("express").Router();
// router.use(authMiddleware);
const authMiddleware = require("../middlewares/authMiddleware");
const { createChronicle } = require("../controllers/chronicleController");

router.post("/", authMiddleware, createChronicle);
// router.put("/:id", updateChronicle);
// router.delete("/:id", deleteChronicle);

module.exports = router;
