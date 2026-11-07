import { ZodError } from 'zod';
import { env } from '../config/env.js';

export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const errorHandler = (err, req, res, next) => {
  const requestId = req.id || 'unknown';

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'The submitted payload contains validation issues.',
        details: err.errors.map(e => ({
          field: e.path.join('.'),
          issue: e.message
        }))
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Handle Custom Domain AppErrors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Fallback for Unexpected / Internal Errors
  console.error(`[UnhandledError] [${requestId}]:`, err);

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred. Please contact support.' 
        : err.message
    },
    meta: {
      requestId,
      timestamp: new Date().toISOString()
    }
  });
};
