const WoredaOffice = require("../models/WoredaOffice");
const factory = require("./handlerFactory");

exports.createWoredaOffice = factory.createOne(WoredaOffice);
exports.getAllWoredaOffices = factory.getAll(WoredaOffice);
exports.getWoredaOfficeById = factory.getOne(WoredaOffice);
exports.updateWoredaOffice = factory.updateOne(WoredaOffice);
exports.deleteWoredaOffice = factory.deleteOne(WoredaOffice);