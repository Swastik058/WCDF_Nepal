const path = require("path");
const GalleryCategory = require("../../models/admin/GalleryCategory");
const GalleryImage = require("../../models/admin/GalleryImage");
const { parseBoolean, serializeGalleryImage } = require("../../utils/galleryHelpers");
const { uploadBufferToCloudinary, deleteFromCloudinary } = require("../../utils/cloudinaryService");

exports.uploadGalleryImages = async (req, res) => {
  const cloudinaryResults = [];
  try {
    const { categoryId, title = "", description = "", isPublished = true } = req.body;
    const files = req.files || [];

    if (!categoryId) {
      return res.status(400).json({ message: "Category is required" });
    }

    if (!files.length) {
      return res.status(400).json({ message: "Please upload at least one image" });
    }

    const category = await GalleryCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Selected gallery category not found" });
    }

    for (const file of files) {
      const result = await uploadBufferToCloudinary(file.buffer, "wcdf/gallery");
      cloudinaryResults.push(result);
    }

    const publishValue = parseBoolean(isPublished, true);

    const createdImages = await GalleryImage.insertMany(
      files.map((file, index) => ({
        title: title.trim() || path.parse(file.originalname).name,
        description: description.trim(),
        imageUrl: cloudinaryResults[index].secure_url,
        publicId: cloudinaryResults[index].public_id,
        category: category._id,
        isPublished: publishValue,
        uploadedBy: req.user?._id || null,
      }))
    );

    const populatedImages = await GalleryImage.find({
      _id: { $in: createdImages.map((item) => item._id) },
    })
      .populate("category", "name description isActive")
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(201).json(populatedImages.map((item) => serializeGalleryImage(req, item)));
  } catch (error) {
    await Promise.all(cloudinaryResults.map((r) => deleteFromCloudinary(r.public_id)));
    return res.status(500).json({ message: "Failed to upload gallery images" });
  }
};

exports.getAllGalleryImagesAdmin = async (req, res) => {
  try {
    const { categoryId = "" } = req.query;
    const query = {};

    if (categoryId) {
      query.category = categoryId;
    }

    const images = await GalleryImage.find(query)
      .populate("category", "name description isActive")
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(images.map((item) => serializeGalleryImage(req, item)));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch gallery images" });
  }
};

exports.updateGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title = "", description = "", categoryId, isPublished } = req.body;

    const image = await GalleryImage.findById(id);
    if (!image) {
      return res.status(404).json({ message: "Gallery image not found" });
    }

    if (categoryId) {
      const category = await GalleryCategory.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Selected category not found" });
      }
      image.category = categoryId;
    }

    image.title = title.trim();
    image.description = description.trim();

    if (isPublished !== undefined) {
      image.isPublished = parseBoolean(isPublished, image.isPublished);
    }

    await image.save();

    const populatedImage = await GalleryImage.findById(image._id)
      .populate("category", "name description isActive")
      .populate("uploadedBy", "name email");

    return res.status(200).json(serializeGalleryImage(req, populatedImage));
  } catch (error) {
    return res.status(500).json({ message: "Failed to update gallery image" });
  }
};

exports.deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await GalleryImage.findByIdAndDelete(id);

    if (!image) {
      return res.status(404).json({ message: "Gallery image not found" });
    }

    await deleteFromCloudinary(image.publicId);

    return res.status(200).json({ message: "Gallery image deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete gallery image" });
  }
};

exports.toggleGalleryImagePublish = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await GalleryImage.findById(id);

    if (!image) {
      return res.status(404).json({ message: "Gallery image not found" });
    }

    image.isPublished = !image.isPublished;
    await image.save();

    const populatedImage = await GalleryImage.findById(image._id)
      .populate("category", "name description isActive")
      .populate("uploadedBy", "name email");

    return res.status(200).json(serializeGalleryImage(req, populatedImage));
  } catch (error) {
    return res.status(500).json({ message: "Failed to toggle publish state" });
  }
};
