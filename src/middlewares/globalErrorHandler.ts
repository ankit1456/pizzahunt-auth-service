import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import logger from '../config/logger';

export default (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err.message, {
    errorName: err.name
  });
  const statusCode = err.statusCode || err.status || 500;

  let errMessage = err.message;
  if (err.name === 'UnauthorizedError') {
    errMessage = 'You are not authorized';
  }
  res.status(statusCode).json({
    errors: [
      {
        type: err.name,
        message: errMessage,
        path: '',
        location: ''
      }
    ]
  });
};
