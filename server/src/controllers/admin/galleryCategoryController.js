const GalleryCategory = require("../../models/admin/GalleryCategory");
const GalleryImage = require("../../models/admin/GalleryImage");

const mapDuplicateKeyError = (error) => {
  if (error?.code === 11000) {
    return "A gallery category with this name already exists";
  }
  return null;
};

exports.createGalleryCategory = async (req, res) => {
  try {
    const { name, description = "", isActive = true } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const category = await GalleryCategory.create({
      name: name.trim(),
      description: description.trim(),
      isActive: Boolean(isActive),
    });

    return res.status(201).json(category);
  } catch (error) {
    const duplicateMessage = mapDuplicateKeyError(error);
    if (duplicateMessage) {
      return res.status(409).json({ message: duplicateMessage });
    }

    return res.status(500).json({ message: "Failed to create gallery category" });
  }
};

exports.getAllGalleryCategoriesAdmin = async (req, res) => {
  try {
    const categories = await GalleryCategory.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "galleryimages",
          localField: "_id",
          foreignField: "category",
          as: "images",
        },
      },
      {
        $addFields: {
          imageCount: { $size: "$images" },
          publishedImageCount: {
            $size: {
              $filter: {
                input: "$images",
                as: "image",
                cond: { $eq: ["$$image.isPublished", true] },
              },
            },
          },
        },
      },
      {
        $project: {
          images: 0,
        },
      },
    ]);

    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch gallery categories" });
  }
};

exports.updateGalleryCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description = "", isActive } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const category = await GalleryCategory.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        description: description.trim(),
        isActive: typeof isActive === "boolean" ? isActive : true,
      },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Gallery category not found" });
    }

    return res.status(200).json(category);
  } catch (error) {
    const duplicateMessage = mapDuplicateKeyError(error);
    if (duplicateMessage) {
      return res.status(409).json({ message: duplicateMessage });
    }

    return res.status(500).json({ message: "Failed to update gallery category" });
  }
};

exports.deleteGalleryCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const imageCount = await GalleryImage.countDocuments({ category: id });
    if (imageCount > 0) {
      return res.status(400).json({
        message: "Cannot delete this category because gallery images still belong to it",
      });
    }

    const category = await GalleryCategory.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: "Gallery category not found" });
    }

    return res.status(200).json({ message: "Gallery category deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete gallery category" });
  }
};

exports.getActiveGalleryCategoriesPublic = async (req, res) => {
  try {
    const categories = await GalleryCategory.aggregate([
      { $match: { isActive: true } },
      { $sort: { name: 1 } },
      {
        $lookup: {
          from: "galleryimages",
          localField: "_id",
          foreignField: "category",
          as: "images",
        },
      },
      {
        $addFields: {
          publishedImageCount: {
            $size: {
              $filter: {
                input: "$images",
                as: "image",
                cond: { $eq: ["$$image.isPublished", true] },
              },
            },
          },
        },
      },
      {
        $project: {
          images: 0,
        },
      },
    ]);

    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch active gallery categories" });
  }
};
