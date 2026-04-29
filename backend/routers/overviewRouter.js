const express = require("express");
const { getOverviewStats } = require("../controllers/overviewController");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/stats", auth, getOverviewStats);

module.exports = router;
