const express = require("express");
const {
  createTransaction,
  getAllTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByRetailer,
  getTransactionsByDate,
} = require("../controllers/transactionController");
const authController = require("../controllers/authController");

const router = express.Router();

const auth = require("../middleware/auth");

router.get(
  "/",
  auth,
  getAllTransactions,
);
router.get("/:id", auth, getTransaction);

router.post("/", auth, authController.restrictTo('retailer'), createTransaction);
router.patch(
  "/:id",
  auth,
  updateTransaction,
);
router.delete(
  "/:id",
  auth,
  deleteTransaction,
);
router.get(
  "/retailer/:retailerId",
  auth,
  getTransactionsByRetailer,
);
router.get(
  "/date",
  auth,
  getTransactionsByDate,
);

module.exports = router;
