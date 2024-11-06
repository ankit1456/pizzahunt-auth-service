import { Config } from '@config';
import { TAuthCookies } from '@customTypes/auth.types';
import { Request, RequestHandler } from 'express';
import { expressjwt } from 'express-jwt';

export default expressjwt({
  secret: Config.REFRESH_TOKEN_SECRET!,
  algorithms: ['HS256'],

  getToken(req: Request) {
    const { refreshToken } = req.cookies as TAuthCookies;

    return refreshToken;
  }
}) as RequestHandler;
