const Customer = require("../models/Customer");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const customerPopOptions = { path: "woreda" };

exports.createCustomer = factory.createOne(Customer);
exports.getAllCustomers = factory.getAll(Customer);
exports.getCustomer = factory.getOne(Customer);
exports.updateCustomer = factory.updateOne(Customer);
exports.deleteCustomer = factory.deleteOne(Customer);

exports.getCustomerByPhone = catchAsync(async (req, res, next) => {
  const customer = await Customer.findOne({ phone: req.params.phone });
  if (!customer) {
    return next(new AppError("Customer not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {customer},
  });
});

exports.getCustomerByFAN = catchAsync(async (req, res, next) => {
  const customer = await Customer.findOne({ fayda: req.params.fayda }).populate(
    customerPopOptions
  );
  if (!customer) {
    return next(new AppError("Customer not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {customer},
  });
});

// New controller to get customers by woredaOffice
exports.getCustomersByWoredaOffice = catchAsync(async (req, res, next) => {
  const woredaOfficeId = req.params.woredaOfficeId;
  console.log(woredaOfficeId, "we're here");

  const customers = await Customer.find({
    woreda: woredaOfficeId,
  }).populate(customerPopOptions);
  console.log(customers, "we're here after customers");

  res.status(200).json({
    status: "success",
    results: customers.length,
    data: customers,
  });
});