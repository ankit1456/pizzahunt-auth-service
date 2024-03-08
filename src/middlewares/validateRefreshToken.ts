import { Request } from 'express';
import { expressjwt } from 'express-jwt';
import { MoreThan } from 'typeorm';
import { Config } from '../config';
import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';
import { RefreshToken } from '../entity/RefreshToken';
import { IRefreshTokenPayload, TAuthCookies } from '../types';

export default expressjwt({
  secret: Config.REFRESH_TOKEN_SECRET!,
  algorithms: ['HS256'],

  getToken(req: Request) {
    const { refreshToken } = req.cookies as TAuthCookies;

    return refreshToken;
  },

  async isRevoked(req: Request, token) {
    try {
      const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
      const refreshToken = await refreshTokenRepository.findOne({
        where: {
          id: (token?.payload as IRefreshTokenPayload).id,
          user: {
            id: (token?.payload as IRefreshTokenPayload).sub
          },
          expiresAt: MoreThan(new Date())
        }
      });

      return refreshToken === null;
    } catch (error) {
      logger.error('Error while getting the refresh token', {
        id: (token?.payload as IRefreshTokenPayload).id
      });
    }
    return true;
  }
});
