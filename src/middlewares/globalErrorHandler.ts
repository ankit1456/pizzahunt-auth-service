import { logger } from '@config';
import { EStatus } from '@customTypes/common';
import { UnAuthorizedError, ValidationError } from '@utils/errors';
import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError as UnauthorizedErrorExpressJwt } from 'express-jwt';
import { ValidationError as TExpressValidationError } from 'express-validator';
import { HttpError } from 'http-errors';
import { QueryFailedError } from 'typeorm';
import { v4 as uuid } from 'uuid';

type ErrorResponse = {
  ref: string;
  type: string;
  message: string;
  statusCode: number;
  status: EStatus;
  stack?: string;
  path: string;
  location: string;
  errors?: TExpressValidationError[];
};

// Error Handler Middleware
export default function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const isProduction = process.env.NODE_ENV === 'prod';
  const errorId = uuid();
  let statusCode = 500;

  const response: ErrorResponse = {
    ref: errorId,
    type: err.name,
    message: err.message,
    status: EStatus.FAIL,
    statusCode,
    stack: isProduction ? undefined : err.stack,
    path: req.path,
    location: 'server'
  };

  if (
    err instanceof UnAuthorizedError ||
    err instanceof UnauthorizedErrorExpressJwt
  ) {
    statusCode = err.status;
    if (err instanceof UnauthorizedErrorExpressJwt) {
      response.message = 'You are not logged in. Please log in and try again';
    }
  } else if (err instanceof ValidationError) {
    statusCode = err.statusCode;
    response.errors = err.errors;
  } else if (err instanceof QueryFailedError) {
    const errorMessage = handleQueryFailedError(err);

    statusCode = errorMessage ? 400 : 500;
    response.message = errorMessage ?? 'Something went wrong';
  } else if (err instanceof HttpError) {
    statusCode = err.statusCode;
  } else {
    response.message = 'Something went wrong. Please try again later';
    response.status = EStatus.ERROR;
  }

  response.statusCode = statusCode;

  logger.error(err.message, {
    id: errorId,
    errorName: err.name,
    statusCode,
    error: err.stack,
    path: req.path,
    method: req.method
  });

  return res.status(statusCode).json(response);
}

function handleQueryFailedError(err: QueryFailedError) {
  const code = (err.driverError as Record<string, string>).code;
  if (code === '23505') {
    return formatUniqueConstraintError(
      (err.driverError as Record<string, string>).detail
    );
  }
  return undefined;
}

// message -> 'Key (email)=(john@gmail.com) already exists.'
function formatUniqueConstraintError(detail: string | undefined) {
  const match = detail?.match(/\((.*?)\)=/);
  return match
    ? `${capitalizeFirstLetter(match[1])} already exists`
    : undefined;
}

const capitalizeFirstLetter = (string: string | undefined) =>
  string ? string.charAt(0).toUpperCase() + string.slice(1) : undefined;
