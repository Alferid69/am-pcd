const mongoose = require("mongoose");
const RetailerCooperative = require("./RetailerCooperative");

const transactionSchema = new mongoose.Schema(
  {
    retailer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RetailerCooperative",
      required: [true, "Retailer ID field is required"],
    },
    customerFayda: {
      type: String,
      required: [true, "Customer fayda number field is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount field is required"],
      min: [1, "Amount cannot be negative"],
    },

    commodity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commodity",
      required: [true, "Commodity field is required"],
    },

    date: { type: Date, default: Date.now },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "success", "failed", "expired"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User field is required"],
    },
  },
  {
    timestamps: true,
  },
);

transactionSchema.post("save", async (doc) => {
  doc.status = "success";
  const shop = await RetailerCooperative.findById(doc.retailer);
  if (shop) {
    shop.transactions.push(doc._id);
    await shop.save();
  }
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
