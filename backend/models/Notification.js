const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    stockRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StockRequest",
      required: true,
    },
    // The generalized role of the users who should see this alert
    targetRole: {
      type: String,
      enum: ["Retailer", "Woreda", "Zone", "Bureau", "Admin"],
      required: true,
    },
    // (Optional) You can bind this to the specific ObjectId of the Woreda, Zone, or Retailer
    // so that only the exact office involved sees the alert, not EVERY Woreda in the system.
    targetOfficeId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
