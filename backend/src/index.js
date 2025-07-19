const express = require("express");
const path = require("path");
const morgan = require("morgan");
const itemsRouter = require("./routes/items");
const statsRouter = require("./routes/stats");
const cors = require("cors");
const { notFound, globalErrorHandler } = require("./middleware/errorHandler");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:3000" }));
// Basic middleware
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/items", itemsRouter);
app.use("/api/stats", statsRouter);

// Not Found
app.use("*", notFound);

// Global error handler (must be last)
app.use(globalErrorHandler);

const server = app.listen(port, () => {
  console.log("Backend running on http://localhost:" + port);
  console.log("Press Ctrl+C to stop the server");
});

// Handle server startup errors
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${port} is already in use. Please use a different port or kill the process using this port.`
    );
  } else {
    console.error("Server error:", error);
  }
});

// Handle process termination
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});

process.on("SIGINT", () => {
  console.log("\nSIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});
