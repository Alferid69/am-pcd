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
        commodity: { type: mongoose.Schema.Types.ObjectId, ref: "Commodity", required: true },
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
  }
);

// Automatic Stock Management Hook
// When the allocation status changes to DELIVERED, physically add stock to the Retailer Cooperative
allocationSchema.pre("save", async function (next) {
  // Only execute this logic if the status JUST changed to DELIVERED
  if (this.isModified("status") && this.status === "DELIVERED") {
    
    // 1. Fetch the corresponding Retailer Cooperative
    const RetailerCooperative = mongoose.model("RetailerCooperative");
    const retailer = await RetailerCooperative.findById(this.retailerCooperative);

    if (retailer) {
      // 2. Loop over every item in the shipping allocation
      this.allocatedItems.forEach((allocatedItem) => {
        // Look for the commodity in the retailer's current inventory
        const itemIndex = retailer.availableCommodity.findIndex(
          (rcItem) => rcItem.commodity.toString() === allocatedItem.commodity.toString()
        );

        if (itemIndex > -1) {
          // If they already have this commodity, just increase the quantity
          retailer.availableCommodity[itemIndex].quantity += allocatedItem.quantity;
        } else {
          // If they don't have it yet, add a new nested object to the array
          retailer.availableCommodity.push({
            commodity: allocatedItem.commodity,
            quantity: allocatedItem.quantity,
          });
        }
      });

      // 3. Save the modified inventory back to the database
      // This might optionally trigger other hooks on the RetailerCooperative model!
      await retailer.save();
    }
  }

  next();
});

const Allocation = mongoose.model("Allocation", allocationSchema);
module.exports = Allocation;
