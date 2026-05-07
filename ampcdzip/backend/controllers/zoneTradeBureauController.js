const ZoneTradeBureau = require("../models/ZoneTradeBureau");
const factory = require("./handlerFactory");

exports.createZoneTradeBureau = factory.createOne(ZoneTradeBureau);
exports.getAllZoneTradeBureaus = factory.getAll(ZoneTradeBureau);
exports.getZoneTradeBureauById = factory.getOne(ZoneTradeBureau);
exports.updateZoneTradeBureau = factory.updateOne(ZoneTradeBureau);
exports.deleteZoneTradeBureau = factory.deleteOne(ZoneTradeBureau);