const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue?.username || err.keyValue?.name || Object.values(err.keyValue)[0];
  const message = `Duplicate field value: '${value}'. Please use a different value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((error) => error.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token! Please login again.", 401);

const handleJWTExpiredError = () =>
  new AppError("Your session has expired! Please login again.", 401);

const sendErrorDev = (err, req, res) => {
  // API Response
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // Non-API / Fallback Log & Response
  console.error("ERROR 🔥: ", err);
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    // Operational, trusted error: send message & actual status code to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    // Programming or other unknown error: don't leak error details
    console.error("ERROR 🔥: ", err);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }

  // Non-API Fallback Response
  console.error("ERROR 🔥: ", err);
  return res.status(500).json({
    status: "error",
    message: "Something went wrong!",
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    // Shallow copy + retain prototype/custom operational flag properties
    let error = Object.create(err);
    error.message = err.message;
    error.statusCode = err.statusCode;
    error.status = err.status;

    if (err.name === "CastError") error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === "ValidationError") error = handleValidationErrorDB(err);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
