const Chronicle = require("../models/chronicleModel");
const User = require("../models/userModel");
const { detachEncryptedImagesFromEntry } = require("./uploadController");

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

const hasExactKeys = (value, keys) =>
  value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.keys(value).length === keys.length &&
  keys.every((key) => Object.hasOwn(value, key));

const isCanonicalBase64Url = (value, minLength, maxLength) => {
  if (
    typeof value !== "string" ||
    value.length < minLength ||
    value.length > maxLength ||
    !/^[A-Za-z0-9_-]+$/.test(value)
  ) return false;

  const decoded = Buffer.from(value, "base64url");
  return decoded.toString("base64url") === value;
};

const isValidEncryptedPayload = (payload) =>
  hasExactKeys(payload, ["algorithm", "version", "iv", "ciphertext"]) &&
  payload.algorithm === "AES-256-GCM" &&
  payload.version === 1 &&
  isCanonicalBase64Url(payload.iv, 16, 16) &&
  Buffer.from(payload.iv, "base64url").length === 12 &&
  isCanonicalBase64Url(payload.ciphertext, 24, 349547) &&
  Buffer.from(payload.ciphertext, "base64url").length >= 17;

const createEncryptedChronicle = async (req, res) => {
  const body = req.body;
  const allowedKeys = ["_id", "date", "encryptedPayload"];
  const requiredKeys = ["_id", "date", "encryptedPayload"];

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    Object.keys(body).some((key) => !allowedKeys.includes(key)) ||
    requiredKeys.some((key) => !Object.hasOwn(body, key)) ||
    !isValidObjectId(body._id) ||
    typeof body.date !== "string" ||
    Number.isNaN(new Date(body.date).getTime()) ||
    !isValidEncryptedPayload(body.encryptedPayload)
  ) {
    return res.status(400).json({ message: "Invalid encrypted entry" });
  }

  const encryptionConfigured = await User.exists({
    _id: req.user.id,
    e2eeMetadata: { $exists: true },
  });
  if (!encryptionConfigured) {
    return res.status(409).json({ message: "Configure encryption before saving encrypted entries" });
  }

  try {
    const chronicle = await Chronicle.create({
      _id: body._id,
      date: new Date(body.date),
      encrypted: true,
      encryptedPayload: body.encryptedPayload,
      user: req.user.id,
    });

    return res.status(201).json({
      message: "Encrypted chronicle created successfully",
      chronicle,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Entry already exists" });
    }
    return res.status(400).json({ message: "Could not save encrypted entry" });
  }
};

const getChronicles = async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 20);
  const skip = (page - 1) * limit;
  const filter = { user: req.user.id };
  const sortDirection = req.query.sort === "oldest" ? 1 : -1;
  const sortOption = {
    date: sortDirection,
    createdAt: sortDirection,
    _id: sortDirection,
  };

  try {
    const chronicles = await Chronicle.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const totalChronicles = await Chronicle.countDocuments(filter);

    const totalPages = Math.ceil(totalChronicles / limit);
    return res.status(200).json({
      page,
      limit,
      totalChronicles,
      totalPages,
      chronicles,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const getChronicleById = async (req, res) => {
  const chronicleId = req.params.id;

  if (!isValidObjectId(chronicleId)) {
    return res.status(400).json({ message: "Invalid chronicle id" });
  }

  try {
    const chronicle = await Chronicle.findById(chronicleId);
    if (!chronicle) {
      return res.status(404).json({ message: "No such chronicle exists." });
    } else {
      if (chronicle.user.toString() === req.user.id) {
        return res.status(200).json({ chronicle });
      } else {
        return res.status(404).json({ message: "No such chronicle exists." });
      }
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateChronicleById = async (req, res) => {
  const chronicleId = req.params.id;

  if (!isValidObjectId(chronicleId)) {
    return res.status(400).json({ message: "Invalid chronicle id" });
  }

  try {
    const chronicle = await Chronicle.findById(chronicleId);
    if (!chronicle) {
      return res.status(404).json({ message: "No such chronicle exists." });
    }

    if (chronicle.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "No such chronicle exists." });
    }

    const body = req.body;
    if (
      !chronicle.encrypted ||
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      !hasExactKeys(body, ["encryptedPayload"]) ||
      !isValidEncryptedPayload(body.encryptedPayload)
    ) {
      return res.status(400).json({ message: "Only encrypted entry updates are supported" });
    }

    const encryptionConfigured = await User.exists({
      _id: req.user.id,
      e2eeMetadata: { $exists: true },
    });
    if (!encryptionConfigured) {
      return res.status(409).json({ message: "Configure encryption before updating encrypted entries" });
    }

    chronicle.encryptedPayload = body.encryptedPayload;
    await chronicle.save();
    return res.status(200).json({ message: "Encrypted chronicle updated successfully", chronicle });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteChronicleById = async (req, res) => {
  const chronicleId = req.params.id;

  if (!isValidObjectId(chronicleId)) {
    return res.status(400).json({ message: "Invalid chronicle id" });
  }

  try {
    const chronicle = await Chronicle.findById(chronicleId);
    if (!chronicle) {
      return res.status(404).json({ message: "No such chronicle exists." });
    } else {
      if (chronicle.user.toString() === req.user.id) {
        await Chronicle.findByIdAndDelete(chronicleId);
        await detachEncryptedImagesFromEntry(req.user.id, chronicleId);
        return res.status(200).json({
          message: "Chronicle deleted successfully",
        });
      } else {
        return res.status(404).json({ message: "No such chronicle exists." });
      }
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createChronicle: createEncryptedChronicle,
  getChronicles,
  getChronicleById,
  updateChronicleById,
  deleteChronicleById,
};
