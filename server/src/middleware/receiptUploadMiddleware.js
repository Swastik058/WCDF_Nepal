const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file
const MAX_FILES = 5;

// Use memory storage so we can pipe the buffer directly to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error("Only images (JPEG, PNG, WebP) and PDF files are allowed"));
};

const receiptUpload = multer({
  storage,
  fileFilter,
  limits: {
    files: MAX_FILES,
    fileSize: MAX_FILE_SIZE,
  },
});

// Upload a single file buffer to Cloudinary
const uploadBufferToCloudinary = (buffer, mimetype, folder = "wcdf/receipts") => {
  return new Promise((resolve, reject) => {
    const isImage = mimetype.startsWith("image/");
    const resourceType = isImage ? "image" : "raw";

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        use_filename: false,
        unique_filename: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

// Delete a file from Cloudinary (called when admin removes a receipt)
const deleteFromCloudinary = async (publicId, mimeType = "image/jpeg") => {
  try {
    const isImage = (mimeType || "").startsWith("image/");
    const resourceType = isImage ? "image" : "raw";
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    // Log but don't throw — a failed Cloudinary delete shouldn't break the request
    console.error(`[Cloudinary] Failed to delete ${publicId}:`, err.message);
  }
};

// Check if Cloudinary is configured before allowing uploads
const requireCloudinaryConfig = (req, res, next) => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return res.status(503).json({
      message:
        "Receipt uploads are not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your server .env file.",
    });
  }
  next();
};

module.exports = {
  receiptUpload,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
  requireCloudinaryConfig,
};
