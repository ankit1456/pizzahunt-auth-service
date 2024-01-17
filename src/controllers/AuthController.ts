import { NextFunction, Response } from 'express';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { JwtPayload } from 'jsonwebtoken';
import { Logger } from 'winston';
import { CredentialService } from '../services/CredentialService';
import { TokenService } from '../services/TokenService';
import { UserService } from '../services/UserService';
import { AuthRequest, RegisterUserRequest } from '../types';
import { User } from '../entity/User';
import { Roles } from '../types/roles.enum';
export class AuthController {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private credentialService: CredentialService,
    private logger: Logger
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({
        errors: result.array()
      });
    }
    const { firstName, lastName, email, password } = req.body;

    this.logger.debug('Request initiated for registering user', {
      firstName,
      lastName,
      email,
      password: '*******',
      role: Roles.CUSTOMER
    });
    try {
      const newUser = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role: Roles.CUSTOMER
      });
      this.logger.info('User has been registered', { id: newUser.id });

      const payload: JwtPayload = {
        sub: newUser.id,
        role: newUser.role
      };

      const [accessToken, refreshToken] =
        await this.generateAccessAndRefreshTokens(payload, newUser);

      this.setTokensInCookie(res, accessToken, refreshToken);

      res.status(201).json({ ...newUser, password: undefined });
    } catch (error) {
      return next(error);
    }
  }

  async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({
        errors: result.array()
      });
    }
    const { email, password } = req.body;

    this.logger.debug('Request initiated for logging user in', {
      email,
      password: '*******'
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

      this.setTokensInCookie(res, accessToken, refreshToken);

      this.logger.info('User has been logged in', { id: user.id });

      res.status(200).json({ ...user, password: undefined });
    } catch (error) {
      return next(error);
    }
  }

  async self(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.findById(req.auth.sub);

      if (!user) {
        throw createHttpError(404, 'User not found');
      }

      res.json(user);
    } catch (error) {
      return next(error);
    }
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payload: JwtPayload = {
        sub: req.auth.sub,
        role: req.auth.role
      };

      const user = await this.userService.findById(req.auth.sub);

      if (!user) {
        return next(createHttpError(401, 'You are not authorized'));
      }
      const [accessToken, refreshToken] =
        await this.generateAccessAndRefreshTokens(payload, user);

      await this.tokenService.deleteRefreshToken(req.auth?.id);

      this.setTokensInCookie(res, accessToken, refreshToken);
      res.json({ id: user.id });
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
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
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

      res.json({ message: 'Logged out' });
    } catch (error) {
      return next(error);
    }
  }
}
