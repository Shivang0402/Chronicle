const mongoose = require("mongoose");

const Userschema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },

  isEmailVerified: {
    type: Boolean,
    default: false,
  },

  emailVerificationToken: {
    type: String,
    select: false,
  },

  emailVerificationExpires: {
    type: Date,
    select: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  UpdatedAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", Userschema);
module.exports = User;
