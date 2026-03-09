const express = require("express");
const { getPublicEvents } = require("../controllers/eventController");

const router = express.Router();

router.get("/", getPublicEvents);

module.exports = router;
