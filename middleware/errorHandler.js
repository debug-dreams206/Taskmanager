const errorHandler = (err, req, res, _next) => {
  // Always print full error in the server terminal
  console.error(`\n❌ [${req.method} ${req.originalUrl}]`, err.message);
  if (process.env.NODE_ENV !== 'production') console.error(err.stack);

  let status  = err.statusCode || err.status || 500;
  let message = err.message || 'Internal server error';

  // Mongoose: invalid ObjectId
  if (err.name === 'CastError') {
    status  = 404;
    message = `Resource not found (invalid id: ${err.value})`;
  }

  // Mongoose: duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    status  = 400;
    message = `An account with this ${field} already exists`;
  }

  // Mongoose: validation
  if (err.name === 'ValidationError') {
    status  = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  // JWT
  if (err.name === 'JsonWebTokenError')  { status = 401; message = 'Invalid token'; }
  if (err.name === 'TokenExpiredError')  { status = 401; message = 'Token expired — please log in again'; }

  // Mongoose not connected
  if (err.name === 'MongoNotConnectedError' || message.includes('buffering timed out')) {
    status  = 503;
    message = 'Database not connected. Check your MONGO_URI in .env';
  }

  res.status(status).json({
    success: false,
    message,
    // Only expose stack in development
    ...(process.env.NODE_ENV !== 'production' && { debug: err.message }),
  });
};

module.exports = errorHandler;
