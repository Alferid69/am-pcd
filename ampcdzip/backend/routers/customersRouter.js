const express = require("express");

const router = express.Router();

const {
  createCustomer,
  getAllCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomersByWoredaOffice,
  getCustomerByPhone,
  getCustomerByFAN,
} = require("../controllers/customerController");

const auth = require("../middleware/auth");
const authController = require("../controllers/authController");

router.post("/", auth, authController.restrictTo('woreda', 'admin'), createCustomer);
router.get("/", auth, getAllCustomers);
router.get("/:id", auth, getCustomer);

router.get("/fayda/:fayda", auth, getCustomerByFAN);

router.patch("/:id", auth, authController.restrictTo('woreda', 'admin'), updateCustomer);
router.delete("/:id", auth, authController.restrictTo('admin'), deleteCustomer);

router.get("/woredaOffice/:woredaOfficeId", auth, getCustomersByWoredaOffice);

router.get("/phone/:phone", auth, getCustomerByPhone);

module.exports = router;
