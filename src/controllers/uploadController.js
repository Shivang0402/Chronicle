const cloudinary = require("../config/cloudinary");
const crypto = require("crypto");
const EncryptedImageAsset = require("../models/encryptedImageAssetModel");
const Chronicle = require("../models/chronicleModel");

const FOLDER = "chronicle/journal";

const uploadEncryptedImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Encrypted image file is required" });
  }

  try {
    if (req.file.mimetype !== "application/octet-stream") {
      return res.status(400).json({ message: "Only encrypted image uploads are supported" });
    }

    const assetId = crypto.randomBytes(18).toString("hex");
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: FOLDER,
          resource_type: "raw",
          public_id: `encrypted-${assetId}.bin`,
        },
        (error, uploaded) => (error ? reject(error) : resolve(uploaded)),
      );

      stream.end(req.file.buffer);
    });

    try {
      await EncryptedImageAsset.create({ assetId, owner: req.user.id });
    } catch (error) {
      await cloudinary.uploader
        .destroy(result.public_id, { resource_type: "raw" })
        .catch(() => {});
      throw error;
    }

    return res.status(201).json({
      message: "Encrypted image uploaded successfully",
      url: result.secure_url,
      publicId: result.public_id,
      assetId,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const destroyEncryptedAsset = async (asset) => {
  const result = await cloudinary.uploader.destroy(
    `${FOLDER}/encrypted-${asset.assetId}.bin`,
    { resource_type: "raw" },
  );
  if (!result || !["ok", "not found"].includes(result.result)) {
    throw new Error("Cloudinary did not confirm encrypted image deletion");
  }
  await EncryptedImageAsset.deleteOne({ _id: asset._id });
};

const cleanupOrphanedAssets = async (ownerId) => {
  const orphaned = await EncryptedImageAsset.find({
    owner: ownerId,
    pending: false,
    attachedTo: { $size: 0 },
  });
  for (const asset of orphaned) {
    try {
      await destroyEncryptedAsset(asset);
    } catch {
      /* Retry on the next sync. */
    }
  }
};

const cleanupExpiredPendingAssets = async () => {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const expired = await EncryptedImageAsset.find({
    pending: true,
    attachedTo: { $size: 0 },
    createdAt: { $lt: cutoff },
  });
  const orphans = await EncryptedImageAsset.find({
    pending: false,
    attachedTo: { $size: 0 },
  });
  for (const asset of [...expired, ...orphans]) {
    try {
      await destroyEncryptedAsset(asset);
    } catch {
      /* Retry on the next sweep. */
    }
  }
};

const syncEncryptedImageAssets = async (req, res) => {
  const body = req.body;
  const validIds = (ids) =>
    Array.isArray(ids) &&
    ids.length <= 500 &&
    ids.every((id) => typeof id === "string" && /^[a-f0-9]{36}$/.test(id));
  if (
    !body ||
    Object.keys(body).sort().join(",") !==
      "assetIds,entryId,uploadedAssetIds" ||
    !/^[a-f0-9]{24}$/i.test(body.entryId) ||
    !validIds(body.assetIds) ||
    !validIds(body.uploadedAssetIds)
  ) {
    return res
      .status(400)
      .json({ message: "Invalid encrypted image asset list" });
  }
  const assetIds = [...new Set(body.assetIds)];
  const uploadedIds = [...new Set(body.uploadedAssetIds)];
  const allIds = [...new Set([...assetIds, ...uploadedIds])];
  try {
    const entry = await Chronicle.exists({
      _id: body.entryId,
      user: req.user.id,
    });
    if (!entry)
      return res.status(404).json({ message: "No such chronicle exists." });
    const owned = await EncryptedImageAsset.find({
      owner: req.user.id,
      assetId: { $in: allIds },
    });
    if (owned.length !== allIds.length) {
      return res
        .status(404)
        .json({ message: "One or more encrypted images are unavailable." });
    }

    const currentAttached = await EncryptedImageAsset.find({
      owner: req.user.id,
      attachedTo: body.entryId,
    });
    const candidateIds = [
      ...new Set([...currentAttached.map((asset) => asset.assetId), ...allIds]),
    ];
    await EncryptedImageAsset.updateMany(
      { owner: req.user.id, assetId: { $in: candidateIds } },
      { $pull: { attachedTo: body.entryId } },
    );
    if (assetIds.length) {
      await EncryptedImageAsset.updateMany(
        { owner: req.user.id, assetId: { $in: assetIds } },
        { $addToSet: { attachedTo: body.entryId }, $set: { pending: false } },
      );
    }
    if (uploadedIds.length) {
      await EncryptedImageAsset.updateMany(
        { owner: req.user.id, assetId: { $in: uploadedIds } },
        { $set: { pending: false } },
      );
    }
    await cleanupOrphanedAssets(req.user.id);
    return res
      .status(200)
      .json({ message: "Encrypted image references synchronized" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Could not synchronize encrypted images" });
  }
};

const discardPendingEncryptedImage = async (req, res) => {
  const { assetId } = req.params;
  if (!/^[a-f0-9]{36}$/.test(assetId))
    return res
      .status(400)
      .json({ message: "Invalid encrypted image reference" });
  try {
    const asset = await EncryptedImageAsset.findOne({
      owner: req.user.id,
      assetId,
    });
    if (!asset)
      return res.status(404).json({ message: "Encrypted image not found" });
    if (!asset.pending || asset.attachedTo.length) {
      return res
        .status(409)
        .json({ message: "Encrypted image is still in use" });
    }
    await destroyEncryptedAsset(asset);
    return res.status(200).json({ message: "Encrypted image discarded" });
  } catch {
    return res
      .status(502)
      .json({ message: "Could not discard encrypted image" });
  }
};

const detachEncryptedImagesFromEntry = async (ownerId, entryId) => {
  const assets = await EncryptedImageAsset.find({
    owner: ownerId,
    attachedTo: entryId,
  });
  await EncryptedImageAsset.updateMany(
    { owner: ownerId, attachedTo: entryId },
    { $pull: { attachedTo: entryId }, $set: { pending: false } },
  );
  await cleanupOrphanedAssets(ownerId);
  return assets.length;
};

const getEncryptedImage = async (req, res) => {
  const { assetId } = req.params;
  if (!/^[a-f0-9]{36}$/.test(assetId)) {
    return res
      .status(400)
      .json({ message: "Invalid encrypted image reference" });
  }
  try {
    const ownedAsset = await EncryptedImageAsset.exists({ assetId, owner: req.user.id });
    if (!ownedAsset) return res.status(404).json({ message: "Encrypted image not found" });
    const url = cloudinary.url(`${FOLDER}/encrypted-${assetId}.bin`, {
      resource_type: "raw",
      secure: true,
    });
    const response = await fetch(url);
    if (!response.ok)
      return res.status(404).json({ message: "Encrypted image not found" });
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 17 || bytes.length > 5 * 1024 * 1024 + 16) {
      return res.status(422).json({ message: "Invalid encrypted image size" });
    }
    res.set("Content-Type", "application/octet-stream");
    res.set("Cache-Control", "private, max-age=300");
    return res.status(200).send(bytes);
  } catch {
    return res
      .status(502)
      .json({ message: "Could not retrieve encrypted image" });
  }
};

module.exports = {
  uploadEncryptedImage,
  getEncryptedImage,
  syncEncryptedImageAssets,
  discardPendingEncryptedImage,
  detachEncryptedImagesFromEntry,
  cleanupExpiredPendingAssets,
};
