const express = require("express");
const { getPublicChildren, getPublicChild } = require("../controllers/childrenController");

const router = express.Router();

router.get("/public", getPublicChildren);
router.get("/public/:identifier", getPublicChild);

module.exports = router;
