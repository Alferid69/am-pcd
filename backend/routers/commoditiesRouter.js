const express = require("express");
const {
  createCommodity,
  getAllCommodities,
  getCommodity,
  updateCommodity,
  deleteCommodity,
} = require("../controllers/commodityController");
const auth = require("../middleware/auth");
const { restrictTo } = require("../controllers/authController");

const router = express.Router();

router.post("/", auth, restrictTo("bureau", "admin"), createCommodity);
router.get("/", auth, getAllCommodities);
router.get("/:id", auth, getCommodity);
router.patch("/:id", auth, restrictTo("bureau", "admin"), updateCommodity);
router.delete("/:id", auth, restrictTo("bureau", "admin"), deleteCommodity);

module.exports = router;
