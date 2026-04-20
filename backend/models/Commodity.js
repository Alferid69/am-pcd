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
    unit: {
      type: String,
      required: [true, 'Unit field is required'],
      trim: true,
      lowercase: true,
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