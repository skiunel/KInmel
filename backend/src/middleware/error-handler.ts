import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import mongoose from 'mongoose';

type MongoDuplicateKeyError = Error & {
  code?: number;
  keyValue?: Record<string, unknown>;
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = err;
  const mongoError = err as MongoDuplicateKeyError;

  // Mongoose bad ObjectId
  if (err instanceof mongoose.Error.CastError) {
    error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }

  // Mongoose duplicate key
  if (err.name === 'MongoServerError' && mongoError.code === 11000) {
    const field = Object.keys(mongoError.keyValue ?? {})[0] ?? 'unknown';
    error = ApiError.conflict(`Duplicate value for field: ${field}`);
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = ApiError.badRequest('Validation failed', errors as Record<string, string>[]);
  }

  // Determine response shape
  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  const message = error instanceof ApiError ? error.message : 'Internal server error';
  const isOperational = error instanceof ApiError ? error.isOperational : false;

  // Log non-operational (unexpected) errors fully
  if (!isOperational) {
    logger.error(`[UNHANDLED] ${err.message}`, err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(error instanceof ApiError && error.errors && { errors: error.errors }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
