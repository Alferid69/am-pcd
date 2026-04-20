const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name field is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name field is required"],
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Gender field is required"],
    },
    age: {
      type: Number,
      required: [true, "Age field is required"],
    },
    fayda:{
      type: String,
      unique: true,
      index: true,
      required: [true, "FAN field is required"],
    },
    woreda: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WoredaOffice",
      required: [true, "Woreda field is required"],
      index: true,
    },
    phone: {
      type: String,
      required: [true, "Phone field is required"],
      unique: true,
    },
    status: {
      type: String,
      enum: ["available", "taken"],
      default: "available",
    },
    purchasedCommodities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Commodity",
      },
    ],
    lastTransactionDate: Date,
  },

  { timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;