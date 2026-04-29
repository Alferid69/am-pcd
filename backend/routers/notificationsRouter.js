const express = require("express");
const notificationController = require("../controllers/notificationController");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

router.patch("/markAllAsRead", notificationController.markAllAsRead);

router.route("/").get(notificationController.getAllNotifications);

router
  .route("/:id")
  .get(notificationController.getNotification)
  .patch(notificationController.updateNotification)
  .delete(notificationController.deleteNotification);

module.exports = router;
