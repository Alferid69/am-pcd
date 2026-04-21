const express = require("express");
const stockRequestController = require("../controllers/stockRequestController");
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

const router = express.Router();

// Since all of these operations deal with internal operations, they require authentication
router.use(auth);

router
  .route("/")
  .get(stockRequestController.getAllStockRequests)
  .post(
    authController.restrictTo('retailer', 'admin'), 
    stockRequestController.createStockRequest
  );

router
  .route("/:id")
  .get(stockRequestController.getStockRequest)
  .patch(
    authController.restrictTo('retailer', 'woreda', 'zone', 'bureau', 'admin'),
    stockRequestController.updateStockRequest
  )
  .delete(
    authController.restrictTo('admin'),
    stockRequestController.deleteStockRequest
  );

module.exports = router;
