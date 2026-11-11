const cloudinary = require("../config/cloudinary");

const FOLDER = "chronicle/journal";

const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Image file is required" });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: FOLDER, resource_type: "image" },
        (error, uploaded) => (error ? reject(error) : resolve(uploaded)),
      );

      stream.end(req.file.buffer);
    });

    return res.status(201).json({
      message: "Image uploaded successfully",
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadImage };
