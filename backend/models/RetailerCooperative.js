const mongoose = require("mongoose");

const retailerCooperative = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name field is required"],
      trim: true,
      unique: true,
    },

    woredaOffice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WoredaOffice",
      required: [true, "Woreda Office field is required"],
    },

    availableCommodity: [
      {
        commodity: { type: mongoose.Schema.Types.ObjectId, ref: "Commodity" },
        quantity: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const RetailerCooperative = mongoose.model(
  "RetailerCooperative",
  retailerCooperative
);

module.exports = RetailerCooperative;