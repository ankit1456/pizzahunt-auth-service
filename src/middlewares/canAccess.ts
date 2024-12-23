import { TAuthRequest } from '@customTypes/auth.types';
import { ERoles } from '@utils/constants';
import { ForbiddenError } from '@utils/errors';
import { NextFunction, Request, RequestHandler, Response } from 'express';

export default function canAccess(...roles: ERoles[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const _req = req as TAuthRequest;

    const userRole = _req.auth.role as ERoles;

    if (!roles.includes(userRole)) return next(new ForbiddenError());

    next();
  };
}
