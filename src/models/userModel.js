const mongoose = require("mongoose");

const keyEnvelopeSchema = new mongoose.Schema(
  {
    algorithm: { type: String, enum: ["AES-256-GCM"], required: true },
    version: { type: Number, enum: [1], required: true },
    iv: { type: String, required: true, minlength: 16, maxlength: 16 },
    ciphertext: { type: String, required: true, minlength: 64, maxlength: 64 },
  },
  { _id: false, strict: "throw" },
);

const passphraseWrapSchema = new mongoose.Schema(
  {
    metadataVersion: { type: Number, enum: [1], required: true },
    kdf: {
      algorithm: { type: String, enum: ["Argon2id"], required: true },
      algorithmVersion: { type: String, enum: ["1.3"], required: true },
      memoryKiB: { type: Number, enum: [65536], required: true },
      passes: { type: Number, enum: [3], required: true },
      parallelism: { type: Number, enum: [1], required: true },
      outputBytes: { type: Number, enum: [32], required: true },
      salt: { type: String, required: true, minlength: 22, maxlength: 22 },
    },
    masterKey: { type: keyEnvelopeSchema, required: true },
  },
  { _id: false, strict: "throw" },
);

const e2eeMetadataSchema = new mongoose.Schema(
  {
    metadataVersion: { type: Number, enum: [1], required: true },
    revision: { type: Number, required: true, min: 1 },
    passphraseWrap: { type: passphraseWrapSchema, required: true },
    recoveryWrap: { type: keyEnvelopeSchema, required: true },
  },
  { _id: false, strict: "throw" },
);

const Userschema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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

  passwordResetToken: {
    type: String,
    select: false,
  },

  passwordResetExpires: {
    type: Date,
    select: false,
  },

  e2eeMetadata: {
    type: e2eeMetadataSchema,
    default: undefined,
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
