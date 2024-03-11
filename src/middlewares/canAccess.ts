import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { IAuthRequest, Roles } from '../types/auth.types';

export default function canAccess(...roles: Roles[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const _req = req as IAuthRequest;

    const userRole = _req.auth.role as Roles;

    if (!roles.includes(userRole)) {
      return next(
        createHttpError(403, 'You are not authorized for this operation')
      );
    }

    next();
  };
}
