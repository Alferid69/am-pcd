const Allocation = require("../models/Allocation");
const RetailerCooperative = require("../models/RetailerCooperative");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Setup query population
const popOptions = [
  { path: 'retailerCooperative', select: 'name woredaOffice' },
  { path: 'allocatedItems.commodity', select: 'name unit' }
];

exports.createAllocation = factory.createOne(Allocation);

exports.getAllAllocations = catchAsync(async (req, res, next) => {
  let filter = {};

  if (req.user.role === 'woreda') {
    // Woredas can only see allocations meant for Retailer Cooperatives in their jurisdiction
    const retailers = await RetailerCooperative.find({ woredaOffice: req.user.worksAt }).select('_id');
    const retailerIds = retailers.map(r => r._id);
    filter.retailerCooperative = { $in: retailerIds };
  } 
  else if (req.user.role === 'retailer') {
    // Just in case a retailer fetches them for read-only tracking
    filter.retailerCooperative = req.user.worksAt;
  }

  const dbQuery = { ...req.query, ...filter };

  let query = Allocation.find(dbQuery).populate(popOptions);
  const docs = await query;

  res.status(200).json({
    status: "success",
    length: docs.length,
    data: docs,
  });
});
exports.getAllocation = factory.getOne(Allocation, popOptions);
exports.deleteAllocation = factory.deleteOne(Allocation);

// We need a custom update function instead of factory.updateOne
// to ensure the .pre('save') hook fires when status is updated to DELIVERED
exports.updateAllocation = catchAsync(async (req, res, next) => {
  const doc = await Allocation.findById(req.params.id);

  if (!doc) {
    return next(new AppError("No allocation found with that ID", 404));
  }

  // Prevent modifications if already delivered
  if (doc.status === "DELIVERED") {
    return next(new AppError("This allocation has already been finalized and marked as DELIVERED. It cannot be modified further.", 400));
  }

  if (req.user.role === 'woreda') {
    // Validate jurisdiction
    const retailer = await RetailerCooperative.findById(doc.retailerCooperative);
    if (!retailer || retailer.woredaOffice.toString() !== req.user.worksAt.toString()) {
       return next(new AppError("Forbidden. This allocation goes to a cooperative outside your Woreda.", 403));
    }
    
    // Woredas are ONLY allowed to mark it as Delivered
    if (req.body.status && req.body.status !== "DELIVERED") {
       return next(new AppError("Woreda users can only mark allocations as DELIVERED.", 403));
    }
    
    // Completely prevent Woredas from modifying the allocatedItems maliciously
    if (req.body.allocatedItems) {
       delete req.body.allocatedItems;
    }
  }

  // Update fields
  if (req.body.status) doc.status = req.body.status;
  if (req.body.deliveryDate) doc.deliveryDate = req.body.deliveryDate;
  if (req.body.allocatedItems) doc.allocatedItems = req.body.allocatedItems;

  // The .save() right here is what triggers the math logic in Allocation.js model!
  await doc.save();

  res.status(200).json({
    status: "success",
    data: doc,
  });
});
