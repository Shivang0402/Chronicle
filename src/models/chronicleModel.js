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
        required: false,
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

chronicleSchema.index({ user: 1, date: -1 });
chronicleSchema.index({ user: 1, mood: 1 });
chronicleSchema.index({ user: 1, tags: 1 });

const Chronicle = mongoose.model("Chronicle", chronicleSchema);
module.exports = Chronicle;
