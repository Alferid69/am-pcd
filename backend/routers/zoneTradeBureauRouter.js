const express = require("express");
const zoneTradeBureauController = require("../controllers/zoneTradeBureauController");
const router = express.Router();

const auth = require("../middleware/auth");


router.get(
  "/",
  auth,
  zoneTradeBureauController.getAllZoneTradeBureaus
);
router.post(
  "/",
  auth,
  zoneTradeBureauController.createZoneTradeBureau
);
router.get(
  "/:id",
  auth,
  zoneTradeBureauController.getZoneTradeBureauById
);
router.patch(
  "/:id",
  auth,
  zoneTradeBureauController.updateZoneTradeBureau
);
router.delete(
  "/:id",
  auth,
  zoneTradeBureauController.deleteZoneTradeBureau
);

module.exports = router;