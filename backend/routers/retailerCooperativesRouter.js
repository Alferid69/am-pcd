const express = require("express");
const {
  createRetailerCooperative,
  getAllRetailerCooperatives,
  getRetailerCooperative,
  updateRetailerCooperative,
  deleteRetailerCooperative,
  getRetailerCooperativeDetails,
} = require("../controllers/retailerCooperativeController");

const auth = require("../middleware/auth");

const router = express.Router();


router.get(
  "/",
  auth,
  getAllRetailerCooperatives
);
router.post(
  "/",
  auth,
  createRetailerCooperative
);
router.get(
  "/:id",
  auth,
  getRetailerCooperative
);
router.patch(
  "/:id",
  auth,
  updateRetailerCooperative
);
router.delete(
  "/:id",
  auth,
  deleteRetailerCooperative
);

module.exports = router;