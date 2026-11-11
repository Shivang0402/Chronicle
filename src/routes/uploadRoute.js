const router = require("express").Router();

const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const { uploadImage } = require("../controllers/uploadController");

router.post("/", authMiddleware, upload.single("image"), uploadImage);

module.exports = router;
