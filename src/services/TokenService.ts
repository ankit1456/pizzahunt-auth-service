import fs from 'fs';
import createHttpError from 'http-errors';
import { JwtPayload, sign } from 'jsonwebtoken';
import path from 'path';
import { Repository } from 'typeorm';
import util from 'util';
import { Config } from '../config';
import { RefreshToken } from '../entity/RefreshToken';
import { User } from '../entity/User';

export class TokenService {
  constructor(private refreshTokenRepository: Repository<RefreshToken>) {}

  async generateAccessToken(payload: JwtPayload) {
    let privateKey: Buffer;

    const readFile = util.promisify(fs.readFile);
    try {
      privateKey = await readFile(
        path.join(__dirname, '../../certs/private.pem')
      );
    } catch (err) {
      const error = createHttpError(500, 'Exception while reading private key');
      throw error;
    }
    const accessToken = sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: Config.ACCESS_TOKEN_EXPIRES_IN,
      issuer: Config.SERVICE_NAME
    });

    return accessToken;
  }

  generateRefreshToken(payload: JwtPayload) {
    const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
      algorithm: 'HS256',
      expiresIn: Config.REFRESH_TOKEN_EXPIRES_IN,
      issuer: Config.SERVICE_NAME,
      jwtid: String(payload.id)
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
}
