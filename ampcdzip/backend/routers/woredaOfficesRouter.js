const express = require("express");
const woredaOfficeController = require("../controllers/woredaOfficeController");

const auth = require("../middleware/auth");
const router = express.Router();

router.get(
  "/",
  auth,
  woredaOfficeController.getAllWoredaOffices
);
router.post(
  "/",
  auth,
  woredaOfficeController.createWoredaOffice
);

router.get(
  "/:id/stats",
  auth,
  woredaOfficeController.getWoredaStats
);
router.get(
  "/:id",
  auth,
  woredaOfficeController.getWoredaOfficeById
);
router.patch(
  "/:id",
  auth,
  woredaOfficeController.updateWoredaOffice
);
router.delete(
  "/:id",
  auth,
  woredaOfficeController.deleteWoredaOffice
);

module.exports = router;