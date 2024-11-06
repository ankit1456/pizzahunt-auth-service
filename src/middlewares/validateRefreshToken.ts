import { AppDataSource, Config, logger } from '@config';
import { TAuthCookies, TRefreshTokenPayload } from '@customTypes/auth.types';
import { RefreshToken } from '@entity';
import { Request, RequestHandler } from 'express';
import { expressjwt } from 'express-jwt';
import { MoreThan } from 'typeorm';

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

      const { id, sub } = token?.payload as TRefreshTokenPayload;
      const refreshToken = await refreshTokenRepository.findOne({
        where: {
          id,
          user: {
            id: sub
          },
          expiresAt: MoreThan(new Date())
        }
      });

      return refreshToken === null;
    } catch (error) {
      const refreshTokenDocumentId = (token?.payload as TRefreshTokenPayload)
        .id;
      logger.error('Error while getting the refresh token', {
        id: refreshTokenDocumentId
      });
    }
    return true;
  }
}) as RequestHandler;
