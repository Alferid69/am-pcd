const StockRequest = require("../models/StockRequest");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const popOptions = [
  { path: 'retailerCooperative', select: 'name woredaOffice' },
  { path: 'requestedItems.commodity', select: 'name unit price' }
];

exports.createStockRequest = factory.createOne(StockRequest);
exports.getAllStockRequests = factory.getAll(StockRequest, popOptions);
exports.getStockRequest = factory.getOne(StockRequest, popOptions);
exports.deleteStockRequest = factory.deleteOne(StockRequest);

// We use a custom update function instead of factory.updateOne
// because factory.updateOne uses findByIdAndUpdate, which skips .pre('save') hooks.
// We NEED the .save() method to trigger the Notification generation hook!
exports.updateStockRequest = catchAsync(async (req, res, next) => {
  const doc = await StockRequest.findById(req.params.id);

  if (!doc) {
    return next(new AppError("No Stock Request found with that ID", 404));
  }

  // Update main status if provided
  if (req.body.status) doc.status = req.body.status;
  
  // Update requested items if modified
  if (req.body.requestedItems) doc.requestedItems = req.body.requestedItems;

  // Add highly detailed timeline tracking if provided by the incoming request
  if (req.body.newTimelineEntry) {
    doc.timeline.push(req.body.newTimelineEntry);
  }

  // Using .save() triggers Mongoose pre('save') middleware, which evaluates
  // status changes and creates the appropriate Notification document.
  await doc.save();

  res.status(200).json({
    status: "success",
    data: doc,
  });
});
