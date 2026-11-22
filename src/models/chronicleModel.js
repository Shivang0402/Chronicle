const mongoose = require("mongoose");

const encryptedPayloadSchema = new mongoose.Schema(
  {
    algorithm: { type: String, enum: ["AES-256-GCM"], required: true },
    version: { type: Number, enum: [1], required: true },
    iv: { type: String, required: true, minlength: 16, maxlength: 16 },
    ciphertext: {
      type: String,
      required: true,
      minlength: 24,
      maxlength: 349547,
    },
  },
  { _id: false, strict: "throw" },
);

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
      required: function contentRequired() {
        return !this.encrypted;
      },
      trim: true,
    },
    // Date remains available for ordering/filtering; diary fields stay encrypted.
    encrypted: {
      type: Boolean,
      default: false,
    },
    encryptedPayload: {
      type: encryptedPayloadSchema,
      required: function encryptedPayloadRequired() {
        return this.encrypted === true;
      },
      default: undefined,
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
