const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create an error if user tries to update password. (POST password data)
  if (req.body.password) {
    return next(
      new AppError(
        'This route is not for password update! Please use /updateMyPassword',
        400,
      ),
    );
  }

  // 2) Filter out unwanted fields
  const filteredBody = filterObj(req.body, 'firstName', 'lastName', 'username');
  // if (req.file) filteredBody.photo = req.file.filename;

  // 2) Update data
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});