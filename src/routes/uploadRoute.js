const router = require("express").Router();

const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const {
  uploadImage,
  getEncryptedImage,
  syncEncryptedImageAssets,
  discardPendingEncryptedImage,
} = require("../controllers/uploadController");

router.post("/", authMiddleware, upload.single("image"), uploadImage);
router.post("/encrypted/sync", authMiddleware, syncEncryptedImageAssets);
router.get("/encrypted/:assetId", authMiddleware, getEncryptedImage);
router.delete("/encrypted/pending/:assetId", authMiddleware, discardPendingEncryptedImage);

module.exports = router;
