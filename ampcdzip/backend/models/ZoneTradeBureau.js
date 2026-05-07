const mongoose = require("mongoose");

const zoneTradeBureauSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name field is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email field is required'],
      unique: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const ZoneTradeBureau = mongoose.model("ZoneTradeBureau", zoneTradeBureauSchema);

module.exports = ZoneTradeBureau;