const express = require("express");
const app = express();
const healthRoutes = require("./routes/health");
const authRoutes = require("./routes/authRoute");
const chronicleRoutes = require("./routes/chronicleRoutes");
app.use(express.json());
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chronicle", chronicleRoutes);

module.exports = app;
