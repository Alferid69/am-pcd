const Commodity = require("../models/Commodity");
const factory = require("./handlerFactory");

exports.createCommodity = factory.createOne(Commodity);
exports.getAllCommodities = factory.getAll(Commodity);
exports.getCommodity = factory.getOne(Commodity);
exports.updateCommodity = factory.updateOne(Commodity);
exports.deleteCommodity = factory.deleteOne(Commodity);
