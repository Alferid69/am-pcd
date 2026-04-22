const Notification = require("../models/Notification");
const factory = require("./handlerFactory");

// Here we can use the default handler factory operations.
// These endpoints will be used by the frontend to pull the user's unread UI alerts,
// or for marking an alert as 'isRead: true'.
const catchAsync = require("../utils/catchAsync");

exports.getAllNotifications = catchAsync(async (req, res, next) => {
  let filter = { targetRole: req.user.role };

  // Only Woredas and Retailers have targetOfficeId bound to them in the schema logic
  if (req.user.role === "woreda" || req.user.role === "retailer") {
    filter.targetOfficeId = req.user.worksAt;
  }

  // Allow merging with ?isRead=false from the frontend
  const dbQuery = { ...req.query, ...filter };

  const notifications = await Notification.find(dbQuery).sort("-createdAt").populate("stockRequest");

  res.status(200).json({
    status: "success",
    length: notifications.length,
    data: notifications,
  });
});
exports.getNotification = factory.getOne(Notification, { path: 'stockRequest' });
exports.updateNotification = factory.updateOne(Notification);
exports.deleteNotification = factory.deleteOne(Notification);
