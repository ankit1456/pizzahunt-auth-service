import { Config } from './../config/index';
import { GetVerificationKey, expressjwt } from 'express-jwt';
import JwksClient from 'jwks-rsa';
import { Request } from 'express';
import { AuthCookies } from '../types';

export default expressjwt({
  secret: JwksClient.expressJwtSecret({
    jwksUri: Config.JWKS_URI!,
    cache: true,
    rateLimit: true
  }) as GetVerificationKey,

  algorithms: ['RS256'],
  getToken(req: Request) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.split(' ')[1] !== 'undefined') {
      const token = authHeader.split(' ')[1];

      if (token) {
        return token;
      }
    }

    const { accessToken } = req.cookies as AuthCookies;
    return accessToken;
  }
});
