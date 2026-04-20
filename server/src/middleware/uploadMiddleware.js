const fs = require("fs");
const path = require("path");
const multer = require("multer");

const galleryUploadDir = path.join(__dirname, "../../uploads/gallery");

fs.mkdirSync(galleryUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, galleryUploadDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const baseName = path
      .basename(file.originalname || "gallery-image", extension)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .toLowerCase();

    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${baseName}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
    return;
  }

  cb(new Error("Only image uploads are allowed"));
};

const galleryUpload = multer({
  storage,
  fileFilter,
  limits: {
    files: 12,
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = {
  galleryUpload,
  galleryUploadDir,
};
