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

router.post("/", auth, createCustomer);
router.get("/", auth, getAllCustomers);
router.get("/:id", auth, getCustomer);

router.get("/fayda/:fayda", auth, getCustomerByFAN);

router.patch("/:id", auth, updateCustomer);
router.delete("/:id", auth, deleteCustomer);

router.get("/woredaOffice/:woredaOfficeId", auth, getCustomersByWoredaOffice);

router.get("/phone/:phone", auth, getCustomerByPhone);

module.exports = router;
