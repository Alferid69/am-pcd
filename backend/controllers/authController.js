const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { promisify } = require("util");

exports.signUp = catchAsync(async (req, res, next) => {
  const { username, password, firstName, lastName, role, worksAt, phone, email } = req.body;

  const newUser = await User.create({
    username,
    password,
    firstName,
    lastName,
    role,
    worksAt,
    phone,
    email,
  });
  newUser.password = undefined;

  const token = jwt.sign(
    { id: newUser._id, role: newUser.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

const signToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user);

  const cookieOptions = {
    expires: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ),
    // expires: new Date(new Date().getTime() + 1000 * 60), // 1 minute for testing
    httpOnly: true,
    secure: true, // false in development
    sameSite: "Lax",
  };

  // if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  // 2) Check if user exists and password is correct
  const user = await User.findOne({ username }); // we use + because password is not selected by default

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password.", 401));
  }

  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'logged out', {
    expires: new Date(Date.now() - 10 * 1000), // Set to a date in the past
    httpOnly: true,
    secure: true, // Must match the original cookie's secure flag
    sameSite: 'Lax',
  });
  res.status(200).json({
    status: 'success',
  });
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findOne({ _id: req.user.id }).select('+password');

  // 2) Check the POSTed password is correct
  if (!(await user.correctPassword(req.body.password, user.password))) {
    return next(
      new AppError('The password you entered is not correct! Try again.', 401),
    );
  }

  // 3) Update the password
  user.password = req.body.newPassword;
  await user.save();

  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array like ['retailer', 'woreda', 'admin'].
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};