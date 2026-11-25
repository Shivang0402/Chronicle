const multer = require("multer");

// AES-GCM adds a 16-byte authentication tag to encrypted image uploads.
const MAX_FILE_SIZE = 5 * 1024 * 1024 + 16;

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype === "application/octet-stream") {
    return cb(null, true);
  }

  return cb(new Error("Only image files are allowed"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

module.exports = upload;
