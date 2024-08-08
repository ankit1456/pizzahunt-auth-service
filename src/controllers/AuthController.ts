import { NextFunction, Response } from 'express';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { JwtPayload } from 'jsonwebtoken';
import { Logger } from 'winston';
import { User } from '../entity';
import { CredentialService, TokenService, UserService } from '../services';
import {
  Roles,
  TAuthRequest,
  TLoginUserRequest,
  TRegisterUserRequest
} from '../types/auth.types';

export default class AuthController {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private credentialService: CredentialService,
    private logger: Logger
  ) {}

  async register(req: TRegisterUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({
        errors: result.array()
      });
    }
    const { firstName, lastName, email, password } = req.body;

    this.logger.debug('Registering user', {
      firstName,
      lastName,
      email,
      role: Roles.CUSTOMER
    });
    try {
      const newUser = await this.userService.createUser({
        firstName,
        lastName,
        email,
        password,
        role: Roles.CUSTOMER
      });

      const payload: JwtPayload = {
        sub: newUser.id,
        role: newUser.role
      };

      const [accessToken, refreshToken] =
        await this.generateAccessAndRefreshTokens(payload, newUser);

      const responseWithCookies = this.setTokensInCookie(
        res,
        accessToken,
        refreshToken
      );

      this.logger.info('User has been registered', { id: newUser.id });

      responseWithCookies.status(201).json({ ...newUser, password: undefined });
    } catch (error) {
      return next(error);
    }
  }

  async login(req: TLoginUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({
        errors: result.array()
      });
    }
    const { email, password } = req.body;

    this.logger.debug('Logging user in', {
      email
    });
    try {
      const user = await this.userService.findByEmail(email, {
        includePassword: true
      });

      if (!user) {
        const err = createHttpError(400, 'Email or Password is incorrect');
        return next(err);
      }

      const passwordMatch = await this.credentialService.comparePassword(
        password,
        user.password
      );

      if (!passwordMatch) {
        return next(createHttpError(400, 'Email or Password is incorrect'));
      }

      const payload: JwtPayload = {
        sub: user.id,
        role: user.role
      };
      const [accessToken, refreshToken] =
        await this.generateAccessAndRefreshTokens(payload, user);

      const responseWithCookies = this.setTokensInCookie(
        res,
        accessToken,
        refreshToken
      );

      this.logger.info('User has been logged in', { id: user.id });

      responseWithCookies.status(200).json({ ...user, password: undefined });
    } catch (error) {
      return next(error);
    }
  }

  async self(req: TAuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.findById(req.auth.sub);

      if (!user) return next(createHttpError(404, 'User not found'));

      res.json(user);
    } catch (error) {
      return next(error);
    }
  }

  async refresh(req: TAuthRequest, res: Response, next: NextFunction) {
    try {
      const payload: JwtPayload = {
        sub: req.auth.sub,
        role: req.auth.role
      };

      const user = await this.userService.findById(req.auth.sub);

      if (!user) return next(createHttpError(401, 'You are not authorized'));

      const [accessToken, refreshToken] =
        await this.generateAccessAndRefreshTokens(payload, user);

      await this.tokenService.deleteRefreshToken(req.auth.id);

      const responseWithCookies = this.setTokensInCookie(
        res,
        accessToken,
        refreshToken
      );
      responseWithCookies.json({ id: user.id });
    } catch (error) {
      return next(error);
    }
  }

  async generateAccessAndRefreshTokens(
    payload: JwtPayload,
    user: User
  ): Promise<[string, string]> {
    const accessToken = this.tokenService.generateAccessToken(payload);

    const newRefreshToken = await this.tokenService.persistRefreshToken(user);

    const refreshToken = this.tokenService.generateRefreshToken({
      ...payload,
      id: newRefreshToken.id
    });

    return [accessToken, refreshToken];
  }

  setTokensInCookie(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('accessToken', accessToken, {
      domain: 'localhost',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60, //1 hour
      httpOnly: true
    });
    res.cookie('refreshToken', refreshToken, {
      domain: 'localhost',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1year
      httpOnly: true
    });

    this.logger.info('tokens has been set in cookies');

    return res;
  }

  async logout(req: TAuthRequest, res: Response, next: NextFunction) {
    try {
      await this.tokenService.deleteRefreshToken(req.auth.id);

      this.logger.info('Refresh token has been deleted', {
        id: req.auth.id
      });

      this.logger.info('User has been logged out', {
        id: req.auth.sub
      });
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.json({ message: 'You have been logged out' });
    } catch (error) {
      return next(error);
    }
  }
}
