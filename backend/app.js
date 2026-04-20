const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");

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

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Set security HTTP headers
app.use(helmet());

// Body parser, reading data from  body into req.body
app.use(express.json({ limit: "10mb" }));

app.use("/api/v1/users", usersRouter);
app.use("/api/v1/customers", customersRouter);
app.use("/api/v1/commodities", commoditiesRouter);
app.use("/api/v1/retailerCooperativesBureaus", retailerCooperativesBureauRouter);
app.use("/api/v1/zoneTrades", zoneTradeRouter);
app.use("/api/v1/woredaOffices", woredaOfficesRouter);
app.use("/api/v1/retailerCooperatives", retailerCooperativesRouter);
app.use("/api/v1/stockRequests", stockRequestsRouter);
app.use("/api/v1/notifications", notificationsRouter);

app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;