import { Config } from '@config';
import { TJwtPayload } from '@customTypes/auth.types';
import { RefreshToken, User } from '@entity';
import { sign } from 'jsonwebtoken';
import { Repository } from 'typeorm';

export default class TokenService {
  constructor(
    private readonly refreshTokenRepository: Repository<RefreshToken>
  ) {}

  generateAccessToken(payload: TJwtPayload) {
    const privateKey = Config.PRIVATE_KEY!;

    const accessToken = sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: Config.ACCESS_TOKEN_EXPIRES_IN,
      // expiresIn: '30s',
      issuer: Config.SERVICE_NAME
    });

    return accessToken;
  }

  generateRefreshToken(payload: TJwtPayload) {
    const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
      algorithm: 'HS256',
      expiresIn: Config.REFRESH_TOKEN_EXPIRES_IN,
      issuer: Config.SERVICE_NAME,
      jwtid: payload.id
    });
    return refreshToken;
  }

  async persistRefreshToken(user: User) {
    const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365; // 1 year

    const newRefreshToken = await this.refreshTokenRepository.save({
      user,
      expiresAt: new Date(Date.now() + MS_IN_YEAR)
    });

    return newRefreshToken;
  }

  async deleteRefreshToken(tokenId?: string) {
    await this.refreshTokenRepository.delete({
      id: tokenId
    });
  }
}
