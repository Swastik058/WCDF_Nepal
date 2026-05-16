const fs = require("fs");
const path = require("path");

const buildAbsoluteImageUrl = (req, imageUrl) => {
  if (!imageUrl) return "";
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${req.protocol}://${req.get("host")}${imageUrl}`;
};

const serializeGalleryImage = (req, image) => {
  const data = image.toObject ? image.toObject() : image;
  return {
    ...data,
    imageUrl: buildAbsoluteImageUrl(req, data.imageUrl),
  };
};

const removeGalleryFile = async (imageUrl) => {
  if (!imageUrl || /^https?:\/\//i.test(imageUrl)) return;

  const normalizedPath = imageUrl.replace(/^\/+/, "").split("/").join(path.sep);
  const absolutePath = path.join(__dirname, "../../", normalizedPath);

  try {
    await fs.promises.unlink(absolutePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Failed to delete gallery file:", error.message);
    }
  }
};

const parseBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return fallback;
};

module.exports = {
  buildAbsoluteImageUrl,
  serializeGalleryImage,
  removeGalleryFile,
  parseBoolean,
};
