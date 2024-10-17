// src/middleware/errorHandler.mjs

import ErrorResponse from '../models/ErrorResponseModel.mjs';
import chalk from 'chalk';

export const errorHandler = (err, req, res, next, logger) => {
  let error = { ...err };

  // Log to console and file for dev
  logger.error(chalk.red(err.stack));

  // ErrorResponse instances
  if (err instanceof ErrorResponse) {
    res.status(err.statusCode).json({
      source: err.source,
      success: false,
      statusCode: err.statusCode,
      error: err.message
    });
  } 
  // Axios errors
  else if (err.isAxiosError) {
    const statusCode = err.response?.status || 500;
    const message = err.response?.data?.error || err.message || 'External API error';
    res.status(statusCode).json({
      source: err.source,
      success: false,
      statusCode: statusCode,
      error: message
    });
  }
  // Default to 500 server error
  else {
    res.status(500).json({
      success: false,
      statusCode: 500,
      error: 'Server Error'
    });
  }

  // Log that the server is still running immediately after handling the error
  logger.info(chalk.green.bold('Server encountered an error but is still running'));
};