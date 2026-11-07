const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// Express 5 makes req.query getter-only by default, which throws:
// "Cannot set property query of #<IncomingMessage> which has only a getter"
// when middleware like express-mongo-sanitize or xss-clean assigns to req.query.
const queryDescriptor = Object.getOwnPropertyDescriptor(express.request, "query");
if (queryDescriptor && !queryDescriptor.set) {
  Object.defineProperty(express.request, "query", {
    configurable: true,
    enumerable: true,
    get() {
      return this._query !== undefined ? this._query : queryDescriptor.get.call(this);
    },
    set(val) {
      this._query = val;
    },
  });
}

const app = express();

const globalErrorHandler = require("./controllers/errorController");

const usersRouter = require("./routers/usersRouter");
const customersRouter = require("./routers/customersRouter");
const commoditiesRouter = require("./routers/commoditiesRouter");
const retailerCooperativesBureauRouter = require("./routers/retailerCooperativesBureauRouter");
const zoneTradeRouter = require("./routers/zoneTradeBureauRouter");
const woredaOfficesRouter = require("./routers/woredaOfficesRouter");
const retailerCooperativesRouter = require("./routers/retailerCooperativesRouter");
const stockRequestsRouter = require("./routers/stockRequestsRouter");
const notificationsRouter = require("./routers/notificationsRouter");
const allocationsRouter = require("./routers/allocationRouter");
const transactionsRouter = require("./routers/transactionsRouter");
const overviewRouter = require("./routers/overviewRouter");

const AppError = require("./utils/appError");

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || !process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
}));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Set security HTTP headers
app.use(helmet());

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Data sanitization against NoSQL query injections
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

app.use("/api/v1/users", usersRouter);
app.use("/api/v1/customers", customersRouter);
app.use("/api/v1/commodities", commoditiesRouter);
app.use("/api/v1/retailerCooperativesBureaus", retailerCooperativesBureauRouter);
app.use("/api/v1/zoneTradeBureaus", zoneTradeRouter);
app.use("/api/v1/woredaOffices", woredaOfficesRouter);
app.use("/api/v1/retailerCooperatives", retailerCooperativesRouter);
app.use("/api/v1/stockRequests", stockRequestsRouter);
app.use("/api/v1/notifications", notificationsRouter);
app.use("/api/v1/allocations", allocationsRouter);
app.use("/api/v1/transactions", transactionsRouter);
app.use("/api/v1/overview", overviewRouter);

// Health check and root ping endpoints for monitoring and self-ping
app.get(["/", "/health", "/api/v1/health"], (req, res) => {
  res.status(200).json({
    status: "success",
    message: "am-pcd backend API is running",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;