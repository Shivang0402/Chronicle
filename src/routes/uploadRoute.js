const router = require("express").Router();

const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const { uploadImage, getEncryptedImage } = require("../controllers/uploadController");

router.post("/", authMiddleware, upload.single("image"), uploadImage);
router.get("/encrypted/:assetId", authMiddleware, getEncryptedImage);

module.exports = router;
