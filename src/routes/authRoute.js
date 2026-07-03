const express = require("express");
const router = express.Router();
const { registerUser } = require("../controllers/authController");
const { loginUser } = require("../controllers/authController");
const { getProfile } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/profile", authMiddleware, getProfile);

module.exports = router;
