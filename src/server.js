require("dotenv").config();
const app = require("./app");
const PORT = process.env.PORT || 3000;
const connectDb = require("./config/db");
connectDb();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
