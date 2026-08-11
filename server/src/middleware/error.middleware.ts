import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/response';
import { config } from '../config/env';

export class AppError extends Error {
  public statusCode: number;
  public errors?: Record<string, string>;

  constructor(message: string, statusCode = 400, errors?: Record<string, string>) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors?: Record<string, string>) {
    super(message, 422, errors);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  if (err instanceof ZodError) {
    const formattedErrors: Record<string, string> = {};
    err.errors.forEach((e) => {
      const field = e.path.join('.') || 'general';
      formattedErrors[field] = e.message;
    });
    return sendError(res, 'Validation failed', 422, formattedErrors);
  }

  // Log unhandled server errors in non-test environments
  if (config.nodeEnv !== 'test') {
    console.error('Unhandled Server Error:', err);
  }

  const message =
    config.nodeEnv === 'production' ? 'Internal server error' : err.message;
  return sendError(res, message, 500);
};
