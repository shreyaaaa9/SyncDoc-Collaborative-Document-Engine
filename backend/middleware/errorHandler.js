/**
 * Global error handler middleware
 * Handles all errors thrown in route handlers
 * In production: hides internal error details
 * In development: shows full stack trace
 */
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== "production";

  // Always log the full error server-side
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.error(err.stack || err.message);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
      ...(isDev && { field: err.path }),
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: messages,
    });
  }

  // Mongoose version conflict (optimistic concurrency)
  if (err.name === "VersionError") {
    return res.status(409).json({
      success: false,
      message: "Concurrent update conflict. Please re-sync and try again.",
    });
  }

  // JWT errors (for future auth integration)
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Token expired" });
  }

  // Payload too large
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request payload too large",
    });
  }

  // Generic server error — hide details in production
  res.status(err.statusCode || 500).json({
    success: false,
    message: isDev ? err.message : "Internal Server Error",
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = errorHandler;
