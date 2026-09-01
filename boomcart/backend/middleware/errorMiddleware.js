const notFound = (req, res, next) => {
  const err = new Error(`Not Found — ${req.originalUrl}`);
  res.status(404); next(err);
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  let code = res.statusCode === 200 ? 500 : res.statusCode;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found / Invalid ID Format`;
    error = new Error(message);
    code = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = `Duplicate field value entered. Please use another value.`;
    error = new Error(message);
    code = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new Error(message);
    code = 400;
  }

  res.status(code).json({
    success: false,
    message: error.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
