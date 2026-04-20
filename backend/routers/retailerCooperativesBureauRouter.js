const express = require("express");
const retailerCooperativesBureauController = require("../controllers/retailerCooperativesBureauController");
const router = express.Router();

const auth = require("../middleware/auth");


router.get(
  "/",
  auth,
  retailerCooperativesBureauController.getAllRetailerCooperativesBureaus
);
router.post(
  "/",
  auth,
  retailerCooperativesBureauController.createRetailerCooperativesBureau
);

router.get(
  "/:id",
  auth,
  retailerCooperativesBureauController.getRetailerCooperativesBureauById
);
router.patch(
  "/:id",
  auth,
  retailerCooperativesBureauController.updateRetailerCooperativesBureau
);
router.delete(
  "/:id",
  auth,
  retailerCooperativesBureauController.deleteRetailerCooperativesBureau
);

module.exports = router;