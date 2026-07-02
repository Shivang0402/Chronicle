const userModel = require("../models/user");
const bcrypt = require("bcrypt");

const registerUser = async (req, res) => {
  const { name, username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 12);

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const existingUser = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    return res
      .status(400)
      .json({ message: "Username or email already exists" });
  }
  const newUser = new userModel({
    name,
    username,
    email,
    password: hashedPassword,
  });

  return res
    .status(201)
    .json({ message: "User registered successfully", user: newUser });
};

module.exports = {
  registerUser,
};
