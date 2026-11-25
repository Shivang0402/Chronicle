const mongoose = require("mongoose");

const encryptedImageAssetSchema = new mongoose.Schema(
  {
    assetId: { type: String, required: true, unique: true, match: /^[a-f0-9]{36}$/ },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    attachedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chronicle" }],
    pending: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("EncryptedImageAsset", encryptedImageAssetSchema);
