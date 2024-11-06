import { ValidationError } from '@utils/errors';
import { NextFunction, Request, Response } from 'express';
import { matchedData, validationResult } from 'express-validator';

const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  const result = validationResult(req);

  if (!result.isEmpty()) return next(new ValidationError(result.array()));

  req.body = matchedData<object>(req, { locations: ['body'] });

  next();
};

export default sanitizeRequest;
