const axios = require("axios");

const notFound = (req, res, next) => {
  const err = new Error("Route Not Found");
  err.status = 404;
  next(err);
};

// Global error handler middleware
const globalErrorHandler = (err, req, res, next) => {
  console.error("Error occurred:", err);

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    error: message,
    status: status,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = { notFound, globalErrorHandler };
