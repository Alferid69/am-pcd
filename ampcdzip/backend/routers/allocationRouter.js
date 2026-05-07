const express = require("express");
const allocationController = require("../controllers/allocationController");
const auth = require("../middleware/auth");

const authController = require("../controllers/authController");

const router = express.Router();

router.use(auth);

router
  .route("/")
  .get(allocationController.getAllAllocations)
  .post(
    authController.restrictTo('bureau', 'admin'),
    allocationController.createAllocation
  );

router
  .route("/:id")
  .get(allocationController.getAllocation)
  .patch(
    authController.restrictTo('woreda', 'admin'),
    allocationController.updateAllocation
  )
  .delete(
    authController.restrictTo('admin'),
    allocationController.deleteAllocation
  );

module.exports = router;
