const WoredaOffice = require("../models/WoredaOffice");
const Customer = require("../models/Customer");
const RetailerCooperative = require("../models/RetailerCooperative");
const factory = require("./handlerFactory");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getWoredaStats = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const woreda = await WoredaOffice.findById(id);
  if (!woreda) return next(new AppError("Woreda not found", 404));

  const [customerCount, retailerCount] = await Promise.all([
    Customer.countDocuments({ woreda: id }),
    RetailerCooperative.countDocuments({ woredaOffice: id }),
  ]);

  res.status(200).json({
    status: "success",
    data: {
      woreda,
      customerCount,
      retailerCount,
    },
  });
});

exports.createWoredaOffice = factory.createOne(WoredaOffice);
exports.getAllWoredaOffices = factory.getAll(WoredaOffice);
exports.getWoredaOfficeById = factory.getOne(WoredaOffice);
exports.updateWoredaOffice = factory.updateOne(WoredaOffice);
exports.deleteWoredaOffice = factory.deleteOne(WoredaOffice);