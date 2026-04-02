const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(err);

  // Soroban specific errors
  if (err.message.includes('Contract call failed')) {
    error = {
      statusCode: 400,
      message: 'Smart contract operation failed',
      details: err.message
    };
  }

  // Stellar network errors
  if (err.message.includes('Account not found')) {
    error = {
      statusCode: 404,
      message: 'Stellar account not found',
      details: 'Please ensure the account exists on the network'
    };
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error = {
      statusCode: 400,
      message: 'Validation failed',
      details: err.details
    };
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack, details: error.details })
  });
};

module.exports = { errorHandler };
