const Transaction = require("../models/Transaction");
const Customer = require("../models/Customer");
const RetailerCooperative = require("../models/RetailerCooperative");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createTransaction = catchAsync(async (req, res, next) => {
  const { commodity, amount, customerFayda } = req.body;

  // SECURE: Automatically lock the transaction to the Retailer's jurisdiction
  const retailer = req.user.worksAt;

  const customer = await Customer.findOne(
    { fayda: customerFayda },
    "status purchasedCommodities lastTransactionDate",
  );

  if (!customer) return next(new AppError("Customer not found", 404));

  // if (customer.retailerCooperativeShop._id.toString() !== shopId)
  //   return next(new AppError("ይህ ደንበኛ ከዚ ሱቅ መግዛት አይችልም።", 401));

  // Reset status if 20 days passed
  if (customer.lastTransactionDate) {
    const diffInDays = Math.floor(
      (new Date() - customer.lastTransactionDate) / (1000 * 60 * 60 * 24),
    );
    if (diffInDays >= 20) {
      await Customer.updateOne(
        { fayda: customerFayda },
        { status: "available", purchasedCommodities: [] },
      );
      customer.status = "available";
      customer.purchasedCommodities = [];
    }
  }

  // Check duplicate commodity
  if (customer.purchasedCommodities.includes(commodity)) {
    return next(new AppError("ደንበኛው ይህን እቃ ከዚ በፊት ገዝቷል።", 400));
  }

  const shop = await RetailerCooperative.findById(
    retailer,
    "availableCommodity",
  );
  if (!shop) return next(new AppError("Shop not found", 404));

  const availableCommodity = shop.availableCommodity.find(
    (item) => item.commodity._id.toString() === commodity.toString(),
  );

  if (!availableCommodity) {
    return next(new AppError("Commodity not found in this shop", 404));
  }

  if (availableCommodity.quantity < amount) {
    return next(new AppError("ይህ እቃ አልቋል።", 400));
  }

  // Proceed with transaction
  const transaction = new Transaction({
    ...req.body,
    retailer,
    status: "success",
    user: req.user._id,
    customer: customer._id,
  });

  await Promise.all([
    RetailerCooperative.updateOne(
      { _id: retailer, "availableCommodity.commodity": commodity },
      { $inc: { "availableCommodity.$.quantity": -amount } },
    ),
    Customer.updateOne(
      { fayda: customerFayda },
      {
        $push: { purchasedCommodities: commodity },
        lastTransactionDate: new Date(),
        ...(customer.purchasedCommodities.length + 1 >= 2 && {
          status: "taken",
        }),
      },
    ),
    transaction.save(),
  ]);

  res.status(201).json({
    status: "success",
    data: { transaction },
  });
});

// Generate commodity reports
exports.generateCommodityReports = catchAsync(async (req, res, next) => {
  const commodities = await Transaction.aggregate([
    {
      $group: {
        _id: "$commodity",
        totalQuantity: { $sum: "$amount" },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    commodities,
  });
});

const transactionPopOptions = [
  { path: "commodity", select: "name price baseUnit bulkUnit" },
  { path: "user", select: "username firstName lastName" },
  { path: "retailer", select: "name woredaOffice" },
  { path: "customer", select: "firstName lastName phone fayda" },
];

// exports.getAllTransactions = factory.getAll(Transaction, transactionPopOptions);
exports.getTransaction = factory.getOne(Transaction, transactionPopOptions);
exports.updateTransaction = factory.updateOne(Transaction);
exports.deleteTransaction = factory.deleteOne(Transaction);

exports.getAllTransactions = catchAsync(async (req, res, next) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const transactions = await Transaction.find({
    createdAt: { $gte: thirtyDaysAgo },
  })
    .sort({ createdAt: -1 })
    .populate(transactionPopOptions);

  res.status(200).json({
    status: "success",
    length: transactions.length,
    data: transactions,
  });
});

exports.getTransactionsByDate = catchAsync(async (req, res, next) => {
  const { start, end } = req.query;

  // Validate input
  if (!start && !end) {
    return next(new AppError("Provide at least a start or end date", 400));
  }

  const filter = {};

  if (start) {
    filter.createdAt = { ...filter.createdAt, $gte: new Date(start) };
  }

  if (end) {
    // Add 1 day to include entire end date
    const endDate = new Date(end);
    endDate.setDate(endDate.getDate() + 1);
    filter.createdAt = { ...filter.createdAt, $lt: endDate };
  }

  const transactions = await Transaction.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    length: transactions.length,
    data: transactions,
  });
});

// In your transactions controller file (e.g., transactionController.js)

exports.getTransactionsByRetailer = catchAsync(async (req, res, next) => {
  const { retailerId } = req.params;
  const { start, end } = req.query; // Extract start and end from query parameters

  let filter = {
    retailer: retailerId,
  };

  // If both start and end dates are provided, use them for filtering
  if (start && end) {
    // Add 1 day to the end date to include transactions up to the end of that day
    const endDate = new Date(end);
    endDate.setDate(endDate.getDate() + 1); // Go to the beginning of the next day

    filter.createdAt = {
      $gte: new Date(start),
      $lt: endDate,
    };
  } else if (start) {
    // If only start date is provided, filter from start date onwards
    filter.createdAt = { $gte: new Date(start) };
  } else if (end) {
    // If only end date is provided, filter up to the end of that day
    const endDate = new Date(end);
    endDate.setDate(endDate.getDate() + 1); // Go to the beginning of the next day
    filter.createdAt = { $lt: endDate };
  } else {
    // Default to last 30 days if no dates are provided
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    filter.createdAt = { $gte: thirtyDaysAgo };
  }

  const transactions = await Transaction.find(filter).populate(
    transactionPopOptions,
  );

  res.status(200).json({
    status: "success",
    length: transactions.length,
    data: transactions,
  });
});
