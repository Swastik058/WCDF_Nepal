const express = require("express");
const { getActiveGalleryCategoriesPublic } = require("../controllers/admin/galleryCategoryController");
const { getPublicGalleryImages, getPublicGalleryImagesByCategory } = require("../controllers/galleryController");

const router = express.Router();

router.get("/categories", getActiveGalleryCategoriesPublic);
router.get("/images", getPublicGalleryImages);
router.get("/images/category/:categoryId", getPublicGalleryImagesByCategory);

module.exports = router;
