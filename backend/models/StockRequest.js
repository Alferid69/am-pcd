const mongoose = require("mongoose");
const Notification = require("./Notification");

const stockRequestSchema = new mongoose.Schema(
  {
    retailerCooperative: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RetailerCooperative",
      required: [true, "A stock request must belong to a retailer cooperative"],
    },
    requestedItems: [
      {
        commodity: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Commodity",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
      },
    ],
    status: {
      type: String,
      enum: [
        "PENDING_WOREDA",
        "PENDING_ZONE",
        "PENDING_BUREAU",
        "APPROVED", // Final overall approval
        "REJECTED",
        "FULFILLED", // Request delivered physically
      ],
      default: "PENDING_WOREDA",
    },
    // The Audit Trail (History) Array
    timeline: [
      {
        actor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Ties back to the User who actually clicked the button
          required: true,
        },
        role: {
          type: String, // E.g., 'Woreda', 'Zone', 'Bureau'
          required: true,
        },
        action: {
          type: String,
          enum: ["SUBMITTED", "APPROVED", "REJECTED", "MODIFIED"],
          required: true,
        },
        remarks: {
          type: String,
          trim: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Mongoose Document Middleware: Generates a purely visual Notification on Status Change
stockRequestSchema.pre("save", async function () {
  // Only trigger this logic if the 'status' field was actually modified during this save
  if (!this.isModified("status")) return next();

  let targetRole;
  let message;
  let targetOfficeId; // Will hold the specific ObjectId if targeting a plural entity (Woreda or Retailer)

  // Evaluate who needs to be alerted based on the new status
  switch (this.status) {
    case "PENDING_WOREDA":
      targetRole = "woreda";
      message = "A new Stock Request is waiting for your approval.";
      // Fetch the RetailerCooperative to find out which specific Woreda it resides in
      const retailer = await mongoose.model("RetailerCooperative").findById(this.retailerCooperative);
      if (retailer) {
        targetOfficeId = retailer.woredaOffice; // Point alert only to this specific Woreda
      }
      break;

    case "PENDING_ZONE":
      targetRole = "zone";
      message = "Woreda has approved a Stock Request. Pending your review.";
      // Single Zone Bureau, targetOfficeId not strictly required
      break;

    case "PENDING_BUREAU":
      targetRole = "bureau";
      message = "Zone has approved a Stock Request. Pending final Bureau review.";
      // Single Bureau, targetOfficeId not strictly required
      break;

    case "APPROVED":
      targetRole = "retailer";
      message = "Your Stock Request has been finally approved by the Bureau.";
      targetOfficeId = this.retailerCooperative; // Route back to the exact requesting Retailer
      break;

    case "REJECTED":
      targetRole = "retailer";
      message = "Your Stock Request was rejected. Please check the request timeline for reasons.";
      targetOfficeId = this.retailerCooperative; // Route back to the exact requesting Retailer
      break;
  }

  // If we matched a state that requires an alert, create the ephemeral notification
  if (targetRole && message) {
    const notificationPayload = {
      stockRequest: this._id,
      targetRole: targetRole,
      message: message,
    };
    
    // Only attach targetOfficeId if it was defined
    if (targetOfficeId) {
       notificationPayload.targetOfficeId = targetOfficeId;
    }

    await Notification.create(notificationPayload);
  }

});

const StockRequest = mongoose.model("StockRequest", stockRequestSchema);
module.exports = StockRequest;
