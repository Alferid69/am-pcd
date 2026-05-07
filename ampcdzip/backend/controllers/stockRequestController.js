const StockRequest = require("../models/StockRequest");
const RetailerCooperative = require("../models/RetailerCooperative");
const factory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const popOptions = [
  {
    path: "retailerCooperative",
    select: "name woredaOffice",
    populate: { path: "woredaOffice", select: "name" },
  },
  {
    path: "requestedItems.commodity",
    select: "name baseUnit bulkUnit conversionRate",
  },
];

exports.createStockRequest = catchAsync(async (req, res, next) => {
  // Automatically bind the request to the retailer's workplace, ignoring malicious inputs
  if (req.user.role === "retailer") {
    req.body.retailerCooperative = req.user.worksAt;
  }

  // --- DUPLICATE COMMODITY GUARD ---
  if (req.body.requestedItems && req.body.requestedItems.length > 0) {
    const activePendingStatuses = [
      "PENDING_WOREDA",
      "PENDING_ZONE",
      "PENDING_BUREAU",
    ];
    const existingPending = await StockRequest.find({
      retailerCooperative: req.body.retailerCooperative,
      status: { $in: activePendingStatuses },
    });

    const alreadyPendingCommodityIds = new Set(
      existingPending.flatMap((r) =>
        r.requestedItems.map((i) => i.commodity.toString()),
      ),
    );

    const incomingCommodityIds = req.body.requestedItems.map((i) =>
      i.commodity.toString(),
    );
    const conflicts = incomingCommodityIds.filter((id) =>
      alreadyPendingCommodityIds.has(id),
    );

    if (conflicts.length > 0) {
      return next(
        new AppError(
          `You already have a pending request for one or more of these commodities. Please wait for it to be processed or edit the existing request.`,
          400,
        ),
      );
    }
  }

  // Create an automatic initial timeline entry
  req.body.timeline = [
    {
      actor: req.user._id,
      role: req.user.role,
      action: "SUBMITTED",
      remarks: "Request initiated",
    },
  ];

  const newDoc = await StockRequest.create(req.body);

  res.status(201).json({
    status: "success",
    data: newDoc,
  });
});

exports.getAllStockRequests = catchAsync(async (req, res, next) => {
  let filter = {};

  // Custom Data Fetching Silos Based on Role
  if (req.user.role === "retailer") {
    filter.retailerCooperative = req.user.worksAt;
  } else if (req.user.role === "woreda") {
    // Woredas can only see requests from Retailer Cooperatives within their own jurisdiction
    const retailers = await RetailerCooperative.find({
      woredaOffice: req.user.worksAt,
    }).select("_id");
    const retailerIds = retailers.map((r) => r._id);
    filter.retailerCooperative = { $in: retailerIds };
  } else if (req.user.role === "zone") {
    // Zones shouldn't see un-processed Woreda requests
    filter.status = { $ne: "PENDING_WOREDA" };
  } else if (req.user.role === "bureau") {
    // Bureau only sees things that have survived up to its desk (or history)
    filter.status = {
      $in: ["PENDING_BUREAU", "APPROVED", "REJECTED", "FULFILLED"],
    };
  }

  // Merge the security filter with any query params the frontend sends (like ?status=PENDING_WOREDA)
  const dbQuery = { ...req.query, ...filter };

  // Sorting
  let sortBy = "-createdAt"; // Default
  if (req.query.sort) {
    sortBy = req.query.sort.split(",").join(" ");
  }
  delete dbQuery.sort;

  let query = StockRequest.find(dbQuery).sort(sortBy).populate(popOptions);
  const docs = await query;

  res.status(200).json({
    status: "success",
    length: docs.length,
    data: docs,
  });
});

exports.getStockRequest = factory.getOne(StockRequest, popOptions);
exports.deleteStockRequest = factory.deleteOne(StockRequest);

exports.updateStockRequest = catchAsync(async (req, res, next) => {
  const doc = await StockRequest.findById(req.params.id);

  if (!doc) {
    return next(new AppError("No Stock Request found with that ID", 404));
  }

  // --- AUTOMATED STATUS TRANSITION ---
  // If the frontend sends an action, the backend automatically transitions the underlying document status
  if (req.body.action) {
    const action = req.body.action;

    // Ignore any malicious raw 'status' fields the frontend might have sent
    delete req.body.status;

    if (action === "REJECTED") {
      req.body.status = "REJECTED";
    } else if (action === "APPROVED") {
      if (req.user.role === "woreda") req.body.status = "PENDING_ZONE";
      else if (req.user.role === "zone") req.body.status = "PENDING_BUREAU";
      else if (req.user.role === "bureau") req.body.status = "APPROVED";
    }
  }

  // --- STRICT ROLE-BASED STATE VALIDATION ---
  if (req.user.role === "retailer") {
    // Retailers can edit their request quantities, but ONLY while it's still at the Woreda level
    if (doc.status !== "PENDING_WOREDA") {
      return next(
        new AppError(
          "You can only modify requests that are currently pending at the Woreda.",
          403,
        ),
      );
    }
    // Retailers cannot push the status forward themselves
    if (req.body.status && req.body.status !== "PENDING_WOREDA") {
      return next(
        new AppError(
          "Retailers cannot approve or authorize their own requests.",
          403,
        ),
      );
    }

    // --- DUPLICATE COMMODITY GUARD FOR UPDATES ---
    if (req.body.requestedItems && req.body.requestedItems.length > 0) {
      const activePendingStatuses = [
        "PENDING_WOREDA",
        "PENDING_ZONE",
        "PENDING_BUREAU",
      ];
      const existingPending = await StockRequest.find({
        retailerCooperative: doc.retailerCooperative,
        status: { $in: activePendingStatuses },
        _id: { $ne: doc._id }, // exclude the current document being updated
      });

      const alreadyPendingCommodityIds = new Set(
        existingPending.flatMap((r) =>
          r.requestedItems.map((i) => i.commodity.toString()),
        ),
      );

      const incomingCommodityIds = req.body.requestedItems.map((i) =>
        i.commodity.toString(),
      );
      const conflicts = incomingCommodityIds.filter((id) =>
        alreadyPendingCommodityIds.has(id),
      );

      if (conflicts.length > 0) {
        return next(
          new AppError(
            `You already have a pending request for one or more of these commodities in another active request.`,
            400,
          ),
        );
      }
    }
  }

  if (req.user.role === "woreda") {
    // Validating jurisdiction!
    const retailer = await RetailerCooperative.findById(
      doc.retailerCooperative,
    );
    if (
      !retailer ||
      retailer.woredaOffice.toString() !== req.user.worksAt.toString()
    ) {
      return next(
        new AppError(
          "Forbidden. This request does not belong to a cooperative in your Woreda.",
          403,
        ),
      );
    }
    const allowedStatuses = ["PENDING_WOREDA", "PENDING_ZONE", "REJECTED"];
    if (req.body.status && !allowedStatuses.includes(req.body.status)) {
      return next(
        new AppError(
          "Woreda users can only transition statuses to PENDING_ZONE or REJECTED.",
          403,
        ),
      );
    }
  }

  if (req.user.role === "zone") {
    const allowedStatuses = ["PENDING_ZONE", "PENDING_BUREAU", "REJECTED"];
    if (req.body.status && !allowedStatuses.includes(req.body.status)) {
      return next(
        new AppError(
          "Zone users can only transition statuses to PENDING_BUREAU or REJECTED.",
          403,
        ),
      );
    }
    if (doc.status === "PENDING_WOREDA") {
      return next(
        new AppError(
          "Forbidden. This request is still at the Woreda level.",
          403,
        ),
      );
    }
  }

  if (req.user.role === "bureau") {
    const allowedStatuses = ["PENDING_BUREAU", "APPROVED", "REJECTED"];
    if (req.body.status && !allowedStatuses.includes(req.body.status)) {
      return next(
        new AppError(
          "Bureau users can only transition statuses to APPROVED or REJECTED.",
          403,
        ),
      );
    }
  }

  // --- UPDATE EXECUTION ---

  if (req.body.status) doc.status = req.body.status;
  if (req.body.requestedItems) doc.requestedItems = req.body.requestedItems;

  if (req.body.action) {
    const newTimelineEntry = {
      actor: req.user._id,
      role: req.user.role,
      action: req.body.action,
      remarks: req.body.remarks || "",
    };
    doc.timeline.push(newTimelineEntry);
  }

  // Triggers Mongoose pre('save') middleware for Notifications
  await doc.save();

  res.status(200).json({
    status: "success",
    data: doc,
  });
});
