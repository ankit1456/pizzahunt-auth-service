import { Config } from '@config';
import { TAuthCookies } from '@customTypes/auth.types';
import { Request, RequestHandler } from 'express';
import { GetVerificationKey, expressjwt } from 'express-jwt';
import JwksClient from 'jwks-rsa';

export default expressjwt({
  secret: JwksClient.expressJwtSecret({
    jwksUri: Config.JWKS_URI!,
    cache: true,
    rateLimit: true
  }) as GetVerificationKey,

  algorithms: ['RS256'],
  getToken(req: Request) {
    const authHeader = req.headers.authorization;

    if (
      authHeader?.startsWith('Bearer') &&
      authHeader.split(' ')[1] !== undefined
    ) {
      const token = authHeader.split(' ')[1];

      if (token) return token;
    }
    const { accessToken } = req.cookies as TAuthCookies;

    if (accessToken) return accessToken;
  }
}) as RequestHandler;
