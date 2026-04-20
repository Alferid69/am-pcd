const RetailerCooperativesBureau = require("../models/RetailerCooperativesBureau");
const factory = require("./handlerFactory");

exports.createRetailerCooperativesBureau = factory.createOne(RetailerCooperativesBureau);
exports.getAllRetailerCooperativesBureaus = factory.getAll(RetailerCooperativesBureau);
exports.getRetailerCooperativesBureauById = factory.getOne(RetailerCooperativesBureau);
exports.updateRetailerCooperativesBureau = factory.updateOne(RetailerCooperativesBureau);
exports.deleteRetailerCooperativesBureau = factory.deleteOne(RetailerCooperativesBureau);