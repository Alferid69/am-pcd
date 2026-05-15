const Transaction = require("../models/Transaction");
const Customer = require("../models/Customer");
const StockRequest = require("../models/StockRequest");
const RetailerCooperative = require("../models/RetailerCooperative");
const catchAsync = require("../utils/catchAsync");

// Shared helper: last 30 days date
const thirtyDaysAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d;
};

const todayStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// ─── RETAILER ───────────────────────────────────────────────────────────────
const getRetailerOverview = async (worksAt) => {
  const retailer = await RetailerCooperative.findById(worksAt).populate(
    "availableCommodity.commodity",
    "name baseUnit price",
  );

  const [totalMonth, totalToday] = await Promise.all([
    Transaction.countDocuments({
      retailer: worksAt,
      createdAt: { $gte: thirtyDaysAgo() },
    }),
    Transaction.countDocuments({
      retailer: worksAt,
      createdAt: { $gte: todayStart() },
    }),
  ]);

  // Revenue = sum of amount * commodity.price for last 30 days
  const revAgg = await Transaction.aggregate([
    {
      $match: {
        retailer: retailer._id,
        createdAt: { $gte: thirtyDaysAgo() },
      },
    },
    {
      $lookup: {
        from: "commodities",
        localField: "commodity",
        foreignField: "_id",
        as: "commodityData",
      },
    },
    { $unwind: "$commodityData" },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: { $multiply: ["$amount", "$commodityData.price"] },
        },
      },
    },
  ]);
  const totalRevenue = revAgg[0]?.totalRevenue ?? 0;

  // Low stock = items with quantity === 0 (truly out) vs low (quantity exists on retailer data)
  const inventory = retailer?.availableCommodity ?? [];
  const outOfStock = inventory.filter((i) => i.quantity <= 0).length;
  const lowStock = inventory.filter(
    (i) => i.quantity > 0 && i.quantity < 50,
  ).length;

  const recentTransactions = await Transaction.find({ retailer: worksAt })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("commodity", "name baseUnit")
    .populate("customer", "firstName lastName");

  return {
    statCards: [
      {
        id: "today",
        label: "overview.stats.salesToday",
        value: totalToday,
        color: "blue",
        icon: "activity",
      },
      {
        id: "month",
        label: "overview.stats.sales30Days",
        value: totalMonth,
        color: "indigo",
        icon: "trending_up",
      },
      {
        id: "revenue",
        label: "overview.stats.revenue30Days",
        value: totalRevenue,
        unit: "ETB",
        color: "green",
        icon: "dollar",
      },
      {
        id: "lowstock",
        label: "overview.stats.lowStock",
        value: `${lowStock} low, ${outOfStock} out`,
        color: outOfStock > 0 ? "red" : "amber",
        icon: "package",
      },
    ],
    recentActivity: recentTransactions.map((t) => ({
      id: t._id,
      label: t.customer
        ? `${t.customer.firstName} ${t.customer.lastName}`
        : "—",
      sub: t.commodity
        ? `${t.amount} ${t.commodity.baseUnit} of ${t.commodity.name}`
        : "—",
      date: t.createdAt,
      status: t.status,
    })),
    quickActions: [
      {
        key: "transactions",
        label: "overview.actions.viewMySales",
        path: "/dashboard/transactions",
      },
      {
        key: "stockRequests",
        label: "overview.actions.requestStock",
        path: "/dashboard/stock-requests",
      },
      {
        key: "settings",
        label: "overview.actions.accountSettings",
        path: "/dashboard/settings",
      },
    ],
  };
};

// ─── WOREDA ──────────────────────────────────────────────────────────────────
const getWoredaOverview = async (worksAt) => {
  const retailers = await RetailerCooperative.find(
    { woredaOffice: worksAt },
    "_id",
  );
  const retailerIds = retailers.map((r) => r._id);

  const [customerCount, retailerCount, pendingCount, approvedCount] =
    await Promise.all([
      Customer.countDocuments({ woreda: worksAt }),
      RetailerCooperative.countDocuments({ woredaOffice: worksAt }),
      StockRequest.countDocuments({
        retailerCooperative: { $in: retailerIds },
        status: "PENDING_WOREDA",
      }),
      StockRequest.countDocuments({
        retailerCooperative: { $in: retailerIds },
        status: { $in: ["PENDING_ZONE", "PENDING_BUREAU", "APPROVED"] },
        createdAt: { $gte: thirtyDaysAgo() },
      }),
    ]);

  const recentRequests = await StockRequest.find({
    retailerCooperative: { $in: retailerIds },
    status: "PENDING_WOREDA",
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("retailerCooperative", "name")
    .populate("requestedItems.commodity", "name");

  return {
    statCards: [
      {
        id: "customers",
        label: "overview.stats.totalCustomers",
        value: customerCount,
        color: "blue",
        icon: "users",
      },
      {
        id: "retailers",
        label: "overview.stats.retailerCooperatives",
        value: retailerCount,
        color: "purple",
        icon: "store",
      },
      {
        id: "pending",
        label: "overview.stats.pendingRequests",
        value: pendingCount,
        color: pendingCount > 0 ? "amber" : "green",
        icon: "clock",
      },
      {
        id: "approved",
        label: "overview.stats.forwarded30Days",
        value: approvedCount,
        color: "indigo",
        icon: "check",
      },
    ],
    recentActivity: recentRequests.map((r) => ({
      id: r._id,
      label: r.retailerCooperative?.name ?? "—",
      sub: r.requestedItems?.map((i) => i.commodity?.name).join(", ") ?? "—",
      date: r.createdAt,
      status: r.status,
    })),
    quickActions: [
      {
        key: "stockRequests",
        label: "overview.actions.reviewPendingRequests",
        path: "/dashboard/stock-requests",
      },
      {
        key: "customers",
        label: "overview.actions.manageCustomers",
        path: "/dashboard/customers",
      },
      {
        key: "transactions",
        label: "overview.actions.viewTransactions",
        path: "/dashboard/transactions",
      },
    ],
  };
};

// ─── ZONE ────────────────────────────────────────────────────────────────────
const getZoneOverview = async () => {
  const [pendingZone, sentToBureau, rejected, totalTransactions] =
    await Promise.all([
      StockRequest.countDocuments({ status: "PENDING_ZONE" }),
      StockRequest.countDocuments({
        status: "PENDING_BUREAU",
        createdAt: { $gte: thirtyDaysAgo() },
      }),
      StockRequest.countDocuments({
        status: "REJECTED",
        createdAt: { $gte: thirtyDaysAgo() },
      }),
      Transaction.countDocuments({ createdAt: { $gte: thirtyDaysAgo() } }),
    ]);

  const recentRequests = await StockRequest.find({ status: "PENDING_ZONE" })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate({
      path: "retailerCooperative",
      select: "name woredaOffice",
      populate: { path: "woredaOffice", select: "name" },
    })
    .populate("requestedItems.commodity", "name");

  return {
    statCards: [
      {
        id: "pendingZone",
        label: "overview.stats.awaitingZoneReview",
        value: pendingZone,
        color: pendingZone > 0 ? "amber" : "green",
        icon: "clock",
      },
      {
        id: "sentBureau",
        label: "overview.stats.forwardedToBureau30d",
        value: sentToBureau,
        color: "indigo",
        icon: "arrow_forward",
      },
      {
        id: "rejected",
        label: "overview.stats.rejected30Days",
        value: rejected,
        color: rejected > 0 ? "red" : "green",
        icon: "x_circle",
      },
      {
        id: "transactions",
        label: "overview.stats.systemTransactions30d",
        value: totalTransactions,
        color: "blue",
        icon: "activity",
      },
    ],
    recentActivity: recentRequests.map((r) => ({
      id: r._id,
      label: r.retailerCooperative?.name ?? "—",
      sub: `${r.retailerCooperative?.woredaOffice?.name ?? "—"} · ${r.requestedItems?.map((i) => i.commodity?.name).join(", ") ?? "—"}`,
      date: r.createdAt,
      status: r.status,
    })),
    quickActions: [
      {
        key: "stockRequests",
        label: "overview.actions.reviewZoneRequests",
        path: "/dashboard/stock-requests",
      },
      {
        key: "transactions",
        label: "overview.actions.viewAllTransactions",
        path: "/dashboard/transactions",
      },
    ],
  };
};

// ─── BUREAU ──────────────────────────────────────────────────────────────────
const getBureauOverview = async () => {
  const [pendingBureau, approved, rejected, totalTransactions] =
    await Promise.all([
      StockRequest.countDocuments({ status: "PENDING_BUREAU" }),
      StockRequest.countDocuments({
        status: "APPROVED",
        createdAt: { $gte: thirtyDaysAgo() },
      }),
      StockRequest.countDocuments({
        status: "REJECTED",
        createdAt: { $gte: thirtyDaysAgo() },
      }),
      Transaction.countDocuments({ createdAt: { $gte: thirtyDaysAgo() } }),
    ]);

  const recentRequests = await StockRequest.find({ status: "PENDING_BUREAU" })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate({
      path: "retailerCooperative",
      select: "name woredaOffice",
      populate: { path: "woredaOffice", select: "name" },
    })
    .populate("requestedItems.commodity", "name");

  return {
    statCards: [
      {
        id: "pendingBureau",
        label: "overview.stats.awaitingBureauApproval",
        value: pendingBureau,
        color: pendingBureau > 0 ? "amber" : "green",
        icon: "clock",
      },
      {
        id: "approved",
        label: "overview.stats.approved30Days",
        value: approved,
        color: "green",
        icon: "check",
      },
      {
        id: "rejected",
        label: "overview.stats.rejected30Days",
        value: rejected,
        color: rejected > 0 ? "red" : "green",
        icon: "x_circle",
      },
      {
        id: "transactions",
        label: "overview.stats.totalTransactions30d",
        value: totalTransactions,
        color: "blue",
        icon: "activity",
      },
    ],
    recentActivity: recentRequests.map((r) => ({
      id: r._id,
      label: r.retailerCooperative?.name ?? "—",
      sub: `${r.retailerCooperative?.woredaOffice?.name ?? "—"} · ${r.requestedItems?.map((i) => i.commodity?.name).join(", ") ?? "—"}`,
      date: r.createdAt,
      status: r.status,
    })),
    quickActions: [
      {
        key: "stockRequests",
        label: "overview.actions.reviewPendingApprovals",
        path: "/dashboard/stock-requests",
      },
      {
        key: "allocations",
        label: "overview.actions.manageAllocations",
        path: "/dashboard/allocations",
      },
      {
        key: "transactions",
        label: "overview.actions.viewSystemTransactions",
        path: "/dashboard/transactions",
      },
    ],
  };
};

// ─── MAIN CONTROLLER ────────────────────────────────────────────────────────
exports.getOverviewStats = catchAsync(async (req, res) => {
  const { role, worksAt } = req.user;

  let data;
  if (role === "retailer") data = await getRetailerOverview(worksAt);
  else if (role === "woreda") data = await getWoredaOverview(worksAt);
  else if (role === "zone") data = await getZoneOverview();
  else if (role === "bureau") data = await getBureauOverview();
  else data = await getBureauOverview(); // admin sees same as bureau for now

  res.status(200).json({ status: "success", data });
});
