const express = require("express");
const app = express();
const healthRoutes = require("./routes/health");
const authRoutes = require("./routes/authRoute");
const User = require("./models/user");
app.use(express.json());
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);

module.exports = app;
