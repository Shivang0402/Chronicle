require("dotenv").config();
const app = require("./app");
const PORT = process.env.PORT || 3000;
const connectDb = require("./config/db");
const { cleanupExpiredPendingAssets } = require("./controllers/uploadController");

const startServer = async () => {
  await connectDb();
  void cleanupExpiredPendingAssets().catch(() => {});
  setInterval(() => void cleanupExpiredPendingAssets().catch(() => {}), 60 * 60 * 1000).unref();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
