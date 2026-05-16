const GalleryCategory = require("../models/admin/GalleryCategory");
const GalleryImage = require("../models/admin/GalleryImage");
const { serializeGalleryImage } = require("../utils/galleryHelpers");

exports.getPublicGalleryImages = async (req, res) => {
  try {
    const images = await GalleryImage.find({ isPublished: true })
      .populate({
        path: "category",
        match: { isActive: true },
        select: "name description isActive",
      })
      .sort({ createdAt: -1 });

    const visibleImages = images
      .filter((item) => item.category)
      .map((item) => serializeGalleryImage(req, item));

    return res.status(200).json(visibleImages);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch public gallery images" });
  }
};

exports.getPublicGalleryImagesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await GalleryCategory.findOne({ _id: categoryId, isActive: true });
    if (!category) {
      return res.status(404).json({ message: "Active gallery category not found" });
    }

    const images = await GalleryImage.find({
      category: categoryId,
      isPublished: true,
    })
      .populate("category", "name description isActive")
      .sort({ createdAt: -1 });

    return res.status(200).json(images.map((item) => serializeGalleryImage(req, item)));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch gallery images for this category" });
  }
};
