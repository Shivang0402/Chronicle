const registerUser = (req, res) => {
  res.status(201).json({
    message: "User registration me bhi sab changa sii!",
  });
};
module.exports = {
  registerUser,
};
