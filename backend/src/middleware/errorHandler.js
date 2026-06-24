// src/middleware/errorHandler.js

/** Wraps async route handlers so thrown errors reach the error middleware. */
function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

/** 404 handler for unmatched routes. */
function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

/** Final error handler — always returns JSON, never leaks stack traces in prod. */
function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status || 500;
  const message = err.message || 'Internal server error.';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
}

module.exports = { asyncHandler, notFound, errorHandler };
