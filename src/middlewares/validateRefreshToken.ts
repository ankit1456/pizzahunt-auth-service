import { expressjwt } from 'express-jwt';
import { Config } from '../config';
import { Request } from 'express';
import { AuthCookies, IRefreshTokenPayload } from '../types';
import { AppDataSource } from '../config/data-source';
import { RefreshToken } from '../entity/RefreshToken';
import logger from '../config/logger';

export default expressjwt({
  secret: Config.REFRESH_TOKEN_SECRET!,
  algorithms: ['HS256'],

  getToken(req: Request) {
    const { refreshToken } = req.cookies as AuthCookies;

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
          }
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
