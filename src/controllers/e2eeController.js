const mongoose = require("mongoose");
const User = require("../models/userModel");

const BASE64URL = /^[A-Za-z0-9_-]+$/;

const hasExactKeys = (value, keys) =>
  value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.keys(value).length === keys.length &&
  keys.every((key) => Object.hasOwn(value, key));

const isBase64Url = (value, length, decodedLength) => {
  if (typeof value !== "string" || value.length !== length || !BASE64URL.test(value)) return false;
  const decoded = Buffer.from(value, "base64url");
  return decoded.length === decodedLength && decoded.toString("base64url") === value;
};

const validateEnvelope = (value) =>
  hasExactKeys(value, ["algorithm", "version", "iv", "ciphertext"]) &&
  value.algorithm === "AES-256-GCM" &&
  value.version === 1 &&
  isBase64Url(value.iv, 16, 12) &&
  isBase64Url(value.ciphertext, 64, 48);

const validateMetadata = (body) => {
  if (!hasExactKeys(body, ["passphraseWrap", "recoveryWrap"])) return false;
  const passphraseWrap = body.passphraseWrap;
  if (!hasExactKeys(passphraseWrap, ["metadataVersion", "kdf", "masterKey"])) return false;
  if (passphraseWrap.metadataVersion !== 1 || !validateEnvelope(passphraseWrap.masterKey)) return false;

  const kdf = passphraseWrap.kdf;
  if (
    !hasExactKeys(kdf, [
      "algorithm",
      "algorithmVersion",
      "memoryKiB",
      "passes",
      "parallelism",
      "outputBytes",
      "salt",
    ]) ||
    kdf.algorithm !== "Argon2id" ||
    kdf.algorithmVersion !== "1.3" ||
    kdf.memoryKiB !== 65536 ||
    kdf.passes !== 3 ||
    kdf.parallelism !== 1 ||
    kdf.outputBytes !== 32 ||
    !isBase64Url(kdf.salt, 22, 16)
  ) {
    return false;
  }

  return validateEnvelope(body.recoveryWrap);
};

const getOwnerId = (req) => {
  const ownerId = req.user?.id;
  return mongoose.isValidObjectId(ownerId) ? ownerId : null;
};

const readMetadata = async (req, res) => {
  const ownerId = getOwnerId(req);
  if (!ownerId) return res.status(401).json({ message: "Authentication required" });

  const user = await User.findById(ownerId).select("e2eeMetadata").lean();
  if (!user) return res.status(404).json({ message: "Account not found" });
  return res.json({ configured: Boolean(user.e2eeMetadata), metadata: user.e2eeMetadata || null });
};

const setInitialMetadata = async (req, res) => {
  const ownerId = getOwnerId(req);
  if (!ownerId) return res.status(401).json({ message: "Authentication required" });
  if (!validateMetadata(req.body)) {
    return res.status(400).json({ message: "Invalid encryption metadata" });
  }

  try {
    const metadata = {
      metadataVersion: 1,
      revision: 1,
      passphraseWrap: req.body.passphraseWrap,
      recoveryWrap: req.body.recoveryWrap,
    };
    const user = await User.findOneAndUpdate(
      { _id: ownerId, e2eeMetadata: { $exists: false } },
      { $set: { e2eeMetadata: metadata } },
      { new: true, runValidators: true, projection: { e2eeMetadata: 1 } },
    ).lean();

    if (!user) return res.status(409).json({ message: "Encryption is already configured" });
    return res.status(201).json({ configured: true, metadata: user.e2eeMetadata });
  } catch {
    return res.status(400).json({ message: "Invalid encryption metadata" });
  }
};

const updateMetadata = async (req, res) => {
  const ownerId = getOwnerId(req);
  if (!ownerId) return res.status(401).json({ message: "Authentication required" });
  if (
    !hasExactKeys(req.body, ["expectedRevision", "passphraseWrap", "recoveryWrap"]) ||
    !Number.isSafeInteger(req.body.expectedRevision) ||
    req.body.expectedRevision < 1 ||
    req.body.expectedRevision >= Number.MAX_SAFE_INTEGER ||
    !validateMetadata({ passphraseWrap: req.body.passphraseWrap, recoveryWrap: req.body.recoveryWrap })
  ) {
    return res.status(400).json({ message: "Invalid encryption metadata" });
  }

  try {
    const revision = req.body.expectedRevision + 1;
    const user = await User.findOneAndUpdate(
      { _id: ownerId, "e2eeMetadata.revision": req.body.expectedRevision },
      {
        $set: {
          "e2eeMetadata.revision": revision,
          "e2eeMetadata.passphraseWrap": req.body.passphraseWrap,
          "e2eeMetadata.recoveryWrap": req.body.recoveryWrap,
        },
      },
      { new: true, runValidators: true, projection: { e2eeMetadata: 1 } },
    ).lean();

    if (!user) return res.status(409).json({ message: "Encryption metadata changed; reload and try again" });
    return res.json({ configured: true, metadata: user.e2eeMetadata });
  } catch {
    return res.status(400).json({ message: "Invalid encryption metadata" });
  }
};

module.exports = { readMetadata, setInitialMetadata, updateMetadata };
