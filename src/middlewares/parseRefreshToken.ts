import { Request } from 'express';
import { expressjwt } from 'express-jwt';
import { Config } from '../config';
import { TAuthCookies } from '../types/auth.types';

export default expressjwt({
  secret: Config.REFRESH_TOKEN_SECRET!,
  algorithms: ['HS256'],

  getToken(req: Request) {
    const { refreshToken } = req.cookies as TAuthCookies;

    return refreshToken;
  }
});
