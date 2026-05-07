const mongoose = require("mongoose");

const retailerCooperativesBureauSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name field is required"],
      trim: true,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const RetailerCooperativesBureau = mongoose.model("RetailerCooperativesBureau", retailerCooperativesBureauSchema);

module.exports = RetailerCooperativesBureau;