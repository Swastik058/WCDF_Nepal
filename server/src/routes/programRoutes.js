const express = require("express");
const {
  getPublicPrograms,
  getPublicProgramBySlug,
} = require("../controllers/programController");

const router = express.Router();

router.get("/", getPublicPrograms);
router.get("/:slug", getPublicProgramBySlug);

module.exports = router;
