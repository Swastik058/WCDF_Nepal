const multer = require("multer");

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
    return;
  }
  cb(new Error("Only image uploads are allowed"));
};

const galleryUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    files: 12,
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = { galleryUpload };
