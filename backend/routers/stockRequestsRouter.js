const express = require("express");
const stockRequestController = require("../controllers/stockRequestController");
const auth = require("../middleware/auth");

const router = express.Router();

// Since all of these operations deal with internal operations, they require authentication
router.use(auth);

router
  .route("/")
  .get(stockRequestController.getAllStockRequests)
  .post(stockRequestController.createStockRequest);

router
  .route("/:id")
  .get(stockRequestController.getStockRequest)
  .patch(stockRequestController.updateStockRequest)
  .delete(stockRequestController.deleteStockRequest);

module.exports = router;
