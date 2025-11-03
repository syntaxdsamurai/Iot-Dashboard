/**
 * Handles 404 errors (Route Not Found).
 * This middleware is triggered if no other route matches.
 */
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pass the error to the general error handler
};

/**
 * General-purpose error handling middleware.
 * This should be the last middleware added to app.js.
 * It catches all errors thrown from async or sync code.
 */
export const errorHandler = (err, req, res, next) => {
  // Determine the status code. If the response status code
  // is still 200, it means a new error was thrown, so default to 500.
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle specific Mongoose errors
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Handle Joi validation errors
  if (err.isJoi) {
    statusCode = 400; // Bad Request
    message = err.details.map((d) => d.message).join(', ');
  }

  // Send the final JSON error response
  res.status(statusCode).json({
    message: message,
    // Include stack trace only in development mode for debugging
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};