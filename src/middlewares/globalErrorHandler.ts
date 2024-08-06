import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import logger from '../config/logger';
import { v4 as uuid } from 'uuid';

export default function globalErrorHandler(
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const isProduction = process.env.NODE_ENV === 'prod';
  const statusCode = err.statusCode || err.status || 500;

  let errMessage = isProduction ? 'Something went wrong' : err.message;
  const errorId = uuid();

  logger.error(err.message, {
    id: errorId,
    errorName: err.name,
    statusCode,
    error: err.stack,
    path: req.path,
    method: req.method
  });

  if (err.name === 'UnauthorizedError' && isProduction) {
    errMessage = 'You are not authenticated';
  }
  res.status(statusCode).json({
    errors: [
      {
        ref: errorId,
        type: err.name,
        message: errMessage,
        path: req.path,
        method: req.method,
        stack: isProduction ? undefined : err.stack,
        location: 'server'
      }
    ]
  });
}
