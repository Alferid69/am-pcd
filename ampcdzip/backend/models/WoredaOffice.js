const mongoose = require("mongoose");

const woredaOfficeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name field is required"],
      trim: true,
    },
    email: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const WoredaOffice = mongoose.model("WoredaOffice", woredaOfficeSchema);

module.exports = WoredaOffice;