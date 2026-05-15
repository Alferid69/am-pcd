const RetailerCooperative = require("../models/RetailerCooperative");
const factory = require("./handlerFactory");
const mongoose = require("mongoose");
const Allocation = require("../models/Allocation");
const Transaction = require("../models/Transaction");
const catchAsync = require("../utils/catchAsync");

const retailerCooperativePopOptions = [
  {
    path: "availableCommodity.commodity", // Populating a nested path
    select: "name price baseUnit bulkUnit maxAmountPerCustomer",
  },
  {
    path: "woredaOffice",
    select: "name _id",
  },
];

exports.getRetailerPerformance = catchAsync(async (req, res, next) => {
  const retailerId = req.params.id;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 1. Get Delivered Allocations in last 30 days
  const allocations = await Allocation.aggregate([
    {
      $match: {
        retailerCooperative: new mongoose.Types.ObjectId(retailerId),
        status: "DELIVERED",
        updatedAt: { $gte: thirtyDaysAgo },
      },
    },
    { $unwind: "$allocatedItems" },
    {
      $lookup: {
        from: "commodities",
        localField: "allocatedItems.commodity",
        foreignField: "_id",
        as: "commodityInfo",
      },
    },
    { $unwind: "$commodityInfo" },
    {
      $group: {
        _id: "$allocatedItems.commodity",
        name: { $first: "$commodityInfo.name" },
        unit: { $first: "$commodityInfo.baseUnit" },
        totalAllocated: {
          $sum: {
            $multiply: [
              "$allocatedItems.quantity",
              "$commodityInfo.conversionRate",
            ],
          },
        },
      },
    },
  ]);

  // 2. Get Sales in last 30 days
  const sales = await Transaction.aggregate([
    {
      $match: {
        retailer: new mongoose.Types.ObjectId(retailerId),
        status: "success",
        createdAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: "$commodity",
        totalSold: { $sum: "$amount" },
      },
    },
  ]);

  // 3. Merge data
  const commodityBreakdown = allocations.map((alloc) => {
    const saleMatch = sales.find(
      (s) => s._id.toString() === alloc._id.toString(),
    );
    const totalSold = saleMatch ? saleMatch.totalSold : 0;
    return {
      commodityId: alloc._id,
      name: alloc.name,
      unit: alloc.unit,
      allocated: alloc.totalAllocated,
      sold: totalSold,
      efficiency:
        alloc.totalAllocated > 0
          ? Math.round((totalSold / alloc.totalAllocated) * 100)
          : 0,
    };
  });

  // Calculate overall stats
  const totalAllocated = commodityBreakdown.reduce(
    (sum, item) => sum + item.allocated,
    0,
  );
  const totalSold = commodityBreakdown.reduce(
    (sum, item) => sum + item.sold,
    0,
  );
  const overallEfficiency =
    totalAllocated > 0 ? Math.round((totalSold / totalAllocated) * 100) : 0;

  res.status(200).json({
    status: "success",
    data: {
      overallEfficiency,
      totalAllocated,
      totalSold,
      commodityBreakdown,
    },
  });
});

exports.createRetailerCooperative = factory.createOne(RetailerCooperative);
exports.getAllRetailerCooperatives = factory.getAll(
  RetailerCooperative,
  retailerCooperativePopOptions,
);
exports.getRetailerCooperative = factory.getOne(
  RetailerCooperative,
  retailerCooperativePopOptions,
);
exports.updateRetailerCooperative = factory.updateOne(RetailerCooperative);
exports.deleteRetailerCooperative = factory.deleteOne(RetailerCooperative);
