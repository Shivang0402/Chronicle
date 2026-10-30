const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../utils/mailer");

const tokenLifetime = 24 * 60 * 60 * 1000;

const createToken = () => crypto.randomBytes(32).toString("hex");

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const startVerification = async (user) => {
  const token = createToken();
  user.emailVerificationToken = hashToken(token);
  user.emailVerificationExpires = new Date(Date.now() + tokenLifetime);
  await user.save();

  try {
    await sendEmail(user, token);
  } catch (err) {
    console.error("Verification email could not be sent:", err.message);
  }
};

const registerUser = async (req, res) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (
    typeof name !== "string" ||
    typeof username !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return res.status(400).json({ message: "All fields must be text" });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters" });
  }

  try {
    const existingUser = await userModel.findOne({
      $or: [
        { username: username.trim() },
        { email: email.trim().toLowerCase() },
      ],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new userModel({
      name,
      username,
      email,
      password: hashedPassword,
    });

    await startVerification(newUser);

    return res.status(201).json({
      message:
        "User registered successfully. Check your email to verify your account.",
      user: {
        id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    return res.status(500).json({ message: "Registration failed" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email ||
    !password
  ) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await userModel
      .findOne({ email: email.trim().toLowerCase() })
      .select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT, {
      expiresIn: "7d",
    });

    return res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    return res.status(500).json({ message: "Login failed" });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (typeof token !== "string" || !token) {
    return res.status(400).json({ message: "Verification token is required" });
  }

  try {
    const result = await userModel.updateOne(
      {
        emailVerificationToken: hashToken(token),
        emailVerificationExpires: { $gt: new Date() },
      },
      {
        $set: { isEmailVerified: true },
        $unset: { emailVerificationToken: 1, emailVerificationExpires: 1 },
      },
    );

    if (result.matchedCount === 0) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification link" });
    }

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Could not verify email" });
  }
};

const resendVerification = async (req, res) => {
  const { email } = req.body;
  const message =
    "If an unverified account exists for this email, a verification link has been sent.";

  if (typeof email !== "string" || !email.trim()) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await userModel.findOne({
      email: email.trim().toLowerCase(),
    });

    if (user && !user.isEmailVerified) {
      await startVerification(user);
    }

    return res.status(200).json({ message });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Could not resend verification email" });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Could not load profile" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerification,
  getProfile,
};
