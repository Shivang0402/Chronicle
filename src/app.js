const express = require("express");
const app = express();

const authRoutes = require("./routes/authRoute");
const chronicleRoutes = require("./routes/chronicleRoutes");
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/chronicle", chronicleRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON body" });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid id" });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
