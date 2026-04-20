const RetailerCooperative = require("../models/RetailerCooperative");
const factory = require("./handlerFactory");

const retailerCooperativePopOptions = [
  {
    path: 'availableCommodity.commodity', // Populating a nested path
    select: 'name unit price'
  },
  {
    path: 'woredaOffice',
    select: 'name _id'
  }
];

exports.createRetailerCooperative = factory.createOne(RetailerCooperative);
exports.getAllRetailerCooperatives = factory.getAll(RetailerCooperative,retailerCooperativePopOptions);
exports.getRetailerCooperative = factory.getOne(RetailerCooperative,retailerCooperativePopOptions);
exports.updateRetailerCooperative = factory.updateOne(RetailerCooperative);
exports.deleteRetailerCooperative = factory.deleteOne(RetailerCooperative);
