const cloudinary = require("../config/cloudinary");
const crypto = require("crypto");

const FOLDER = "chronicle/journal";

const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Image file is required" });
  }

  try {
    const encrypted = req.file.mimetype === "application/octet-stream";
    if (!encrypted && !req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const assetId = encrypted ? crypto.randomBytes(18).toString("hex") : null;
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        encrypted
          ? { folder: FOLDER, resource_type: "raw", public_id: `encrypted-${assetId}.bin` }
          : { folder: FOLDER, resource_type: "image" },
        (error, uploaded) => (error ? reject(error) : resolve(uploaded)),
      );

      stream.end(req.file.buffer);
    });

    return res.status(201).json({
      message: encrypted ? "Encrypted image uploaded successfully" : "Image uploaded successfully",
      url: result.secure_url,
      publicId: result.public_id,
      ...(encrypted ? { assetId } : {}),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getEncryptedImage = async (req, res) => {
  const { assetId } = req.params;
  if (!/^[a-f0-9]{36}$/.test(assetId)) {
    return res.status(400).json({ message: "Invalid encrypted image reference" });
  }
  try {
    const url = cloudinary.url(`${FOLDER}/encrypted-${assetId}.bin`, {
      resource_type: "raw",
      secure: true,
    });
    const response = await fetch(url);
    if (!response.ok) return res.status(404).json({ message: "Encrypted image not found" });
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 17 || bytes.length > 5 * 1024 * 1024 + 16) {
      return res.status(422).json({ message: "Invalid encrypted image size" });
    }
    res.set("Content-Type", "application/octet-stream");
    res.set("Cache-Control", "private, max-age=300");
    return res.status(200).send(bytes);
  } catch {
    return res.status(502).json({ message: "Could not retrieve encrypted image" });
  }
};

module.exports = { uploadImage, getEncryptedImage };
