const mongoose = require("mongoose");

const commoditySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ["sugar", "oil"],
      required: [true, 'Name field is required'],
      trim: true,
      lowercase: true,
    },
    price: {
      type: Number,
      required: [true, 'Price field is required'],
      min: [0, 'Price must be a non-negative number'],
    },
    baseUnit: {
      type: String,
      required: [true, 'Base Unit field is required (e.g., kg, liter)'],
      trim: true,
      lowercase: true,
    },
    bulkUnit: {
      type: String,
      required: [true, 'Bulk Unit field is required (e.g., kuntal, jerrycan)'],
      trim: true,
      lowercase: true,
    },
    conversionRate: {
      type: Number,
      required: [true, 'Conversion Rate is required (e.g., 100 for 100kg per kuntal)'],
      min: [1, 'Conversion Rate must be at least 1'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Commodity = mongoose.model("Commodity", commoditySchema);

module.exports = Commodity;