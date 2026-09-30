function errorHandler(err, req, res, next) {
  console.error('[Global Error Handler]:', err.stack || err.message || err);

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500
    ? 'An unexpected server error occurred. Please try again later.'
    : err.message;

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { errorDetails: err.message }),
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found.`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};

