const express = require("express");
const {
  createCommodity,
  getAllCommodities,
  getCommodity,
  updateCommodity,
  deleteCommodity,
} = require("../controllers/commodityController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, createCommodity);
router.get("/", auth, getAllCommodities);
router.get("/:id", auth, getCommodity);
router.patch("/:id", auth, updateCommodity);
router.delete("/:id", auth, deleteCommodity);

module.exports = router;
