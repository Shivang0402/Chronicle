const mongoose = require("mongoose");
const chronicleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: false,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    mood: {
      type: String,
      required: false,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },

  {
    timestamps: true,
  },
);

const Chronicle = mongoose.model("Chronicle", chronicleSchema);
module.exports = Chronicle;
