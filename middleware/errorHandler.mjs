// src/middleware/errorHandler.mjs

import ErrorResponse from '../models/ErrorResponseModel.mjs';
import chalk from 'chalk';

export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log to console for dev
    console.log(chalk.red(err.stack));
    
    // ErrorResponse instances
    if (err instanceof ErrorResponse) {
      return res.status(err.statusCode).json({
          success: false,
          statusCode: err.statusCode,
          error: err.message
      });
    }
    // Axios errors
    if (err.isAxiosError) {
        const statusCode = err.response?.status || 500;
        const message = err.response?.data?.error || err.message || 'External API error';
        return res.status(statusCode).json({
            success: false,
            error: message
        });
    }

    // Default to 500 server error
    res.status(500).json({
        success: false,
        error: 'Server Error'
    });
};