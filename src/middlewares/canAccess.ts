import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { ERoles, TAuthRequest } from '../types/auth.types';

export default function canAccess(...roles: ERoles[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const _req = req as TAuthRequest;

    const userRole = _req.auth.role as ERoles;

    if (!roles.includes(userRole)) {
      return next(
        createHttpError(403, 'You are not authorized to perform this operation')
      );
    }

    next();
  };
}
