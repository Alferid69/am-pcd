const Notification = require("../models/Notification");
const factory = require("./handlerFactory");

// Here we can use the default handler factory operations.
// These endpoints will be used by the frontend to pull the user's unread UI alerts,
// or for marking an alert as 'isRead: true'.
exports.getAllNotifications = factory.getAll(Notification, { path: 'stockRequest' });
exports.getNotification = factory.getOne(Notification, { path: 'stockRequest' });
exports.updateNotification = factory.updateOne(Notification);
exports.deleteNotification = factory.deleteOne(Notification);
