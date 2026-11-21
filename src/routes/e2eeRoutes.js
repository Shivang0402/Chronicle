const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  readMetadata,
  setInitialMetadata,
  updateMetadata,
} = require("../controllers/e2eeController");

const router = express.Router();

router.use(authMiddleware);
router.get("/metadata", readMetadata);
router.post("/metadata", setInitialMetadata);
router.put("/metadata", updateMetadata);

module.exports = router;
