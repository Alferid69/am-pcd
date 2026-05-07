const mongoose = require("mongoose");

const allocationSchema = new mongoose.Schema(
  {
    // The overarching request that generated this physical allocation
    stockRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StockRequest",
      required: [true, "An allocation must be tied to a StockRequest"],
      unique: true,
    },
    // The exact destination
    retailerCooperative: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RetailerCooperative",
      required: [true, "Destination Retailer Cooperative is required"],
    },
    // The items and quantities actually being shipped out of the warehouse
    allocatedItems: [
      {
        commodity: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Commodity",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
    // The worker/bureau user who processed the dispatch
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["DISPATCHED", "DELIVERED"],
      default: "DISPATCHED",
    },
    deliveryDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Automatic Stock Management Hook
// When the allocation status changes to DELIVERED, physically add stock to the Retailer Cooperative
allocationSchema.pre("save", async function () {
  // Only execute this logic if the status JUST changed to DELIVERED
  if (this.isModified("status") && this.status === "DELIVERED") {
    // 1. Fetch the corresponding Retailer Cooperative
    const RetailerCooperative = mongoose.model("RetailerCooperative");
    const retailer = await RetailerCooperative.findById(
      this.retailerCooperative,
    );

    // Grab the Commodity model so we can access its conversionRate
    const Commodity = mongoose.model("Commodity");

    if (retailer) {
      // 2. Loop over every item in the shipping allocation safely using for...of to allow async/await
      for (const allocatedItem of this.allocatedItems) {
        // Pull the commodity data to see what its bulk multiplier is
        const commodityData = await Commodity.findById(allocatedItem.commodity);
        if (!commodityData) continue; // Fail-safe fallback

        // Math magic! Converts bulk units to base units
        // E.g. Oil: 50 jerrycans * 20 L/jerrycan = 1,000 Liters
        const actualReceivedQuantity =
          allocatedItem.quantity * commodityData.conversionRate;

        // Look for the commodity in the retailer's current inventory
        const itemIndex = retailer.availableCommodity.findIndex(
          (rcItem) =>
            rcItem.commodity.toString() === allocatedItem.commodity.toString(),
        );

        if (itemIndex > -1) {
          // If they already have this commodity, just increase the quantity using BASE units
          retailer.availableCommodity[itemIndex].quantity +=
            actualReceivedQuantity;
        } else {
          // If they don't have it yet, add a new nested object to the array using BASE units
          retailer.availableCommodity.push({
            commodity: allocatedItem.commodity,
            quantity: actualReceivedQuantity,
          });
        }
      }

      // 3. Save the modified inventory back to the database
      // This might optionally trigger other hooks on the RetailerCooperative model!
      await retailer.save();
    }
  }
});

const Allocation = mongoose.model("Allocation", allocationSchema);
module.exports = Allocation;
