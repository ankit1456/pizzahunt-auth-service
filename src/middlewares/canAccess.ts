import { NextFunction, Request, Response } from 'express';
import { Roles } from '../types/roles.enum';
import { AuthRequest } from '../types';
import createHttpError from 'http-errors';

export const canAccess = (...roles: Roles[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const _req = req as AuthRequest;

    const userRole = _req.auth.role as Roles;

    if (!roles.includes(userRole)) {
      return next(
        createHttpError(403, 'You are not authorized for this operation')
      );
    }

    next();
  };
};
