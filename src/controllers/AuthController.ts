import {
  TAuthRequest,
  TJwtPayload,
  TLoginUserRequest,
  TRegisterUserRequest
} from '@customTypes/auth.types';
import { User } from '@entity';
import { CredentialService, TokenService, UserService } from '@services';
import { NextFunction, Request, Response } from 'express';
import { Logger } from 'winston';

import {
  BadRequestError,
  NotFoundError,
  UnAuthorizedError
} from '@utils/errors';
import { ERoles, EStatus } from '@utils/constants';

export default class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly credentialService: CredentialService,
    private readonly logger: Logger
  ) {
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.self = this.self.bind(this);
    this.refresh = this.refresh.bind(this);
    this.logout = this.logout.bind(this);
  }

  async register(req: TRegisterUserRequest, res: Response, next: NextFunction) {
    const { firstName, lastName, email, password } = req.body;

    this.logger.debug('Registering user', {
      firstName,
      lastName,
      email,
      role: ERoles.CUSTOMER
    });

    const newUser = await this.userService.create({
      firstName,
      lastName,
      email,
      password,
      role: ERoles.CUSTOMER
    });

    const payload: TJwtPayload = {
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

    responseWithCookies.status(201).json({
      status: EStatus.SUCCESS,
      user: { ...newUser, password: undefined }
    });
  }

  async login(req: TLoginUserRequest, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    this.logger.debug('Logging user in', {
      email
    });
    const user = await this.userService.findOne('email', email, {
      includePassword: true
    });

    if (!user)
      return next(new BadRequestError('Email or Password is incorrect'));

    const passwordMatch = await this.credentialService.comparePassword(
      password,
      user.password
    );

    if (!passwordMatch)
      return next(new BadRequestError('Email or Password is incorrect'));

    const payload: TJwtPayload = {
      sub: user.id,
      role: user.role,
      tenantId: user.tenant?.id
    };

    const [accessToken, refreshToken] =
      await this.generateAccessAndRefreshTokens(payload, user);

    const responseWithCookies = this.setTokensInCookie(
      res,
      accessToken,
      refreshToken
    );

    this.logger.info('User has been logged in', { id: user.id });

    return responseWithCookies.status(200).json({
      status: EStatus.SUCCESS,
      user: { ...user, tenant: undefined, password: undefined }
    });
  }

  async self(_req: Request, res: Response, next: NextFunction) {
    const req = _req as TAuthRequest;

    const user = await this.userService.findOne('id', req.auth.sub);

    if (!user) return next(new NotFoundError('User not found'));

    return res.json({ status: EStatus.SUCCESS, user });
  }

  async refresh(_req: Request, res: Response, next: NextFunction) {
    const req = _req as TAuthRequest;

    const payload: TJwtPayload = {
      sub: req.auth.sub,
      role: req.auth.role,
      tenantId: req.auth.tenantId
    };

    const user = await this.userService.findOne('id', req.auth.sub);

    if (!user) return next(new UnAuthorizedError());

    const [accessToken, refreshToken] =
      await this.generateAccessAndRefreshTokens(payload, user);

    await this.tokenService.deleteRefreshToken(req.auth.id);

    const responseWithCookies = this.setTokensInCookie(
      res,
      accessToken,
      refreshToken
    );
    return responseWithCookies.json({ status: EStatus.SUCCESS, id: user.id });
  }

  async generateAccessAndRefreshTokens(
    payload: TJwtPayload,
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

  async logout(_req: Request, res: Response, next: NextFunction) {
    const req = _req as TAuthRequest;

    await this.tokenService.deleteRefreshToken(req.auth.id);

    this.logger.info('Refresh token has been deleted', {
      id: req.auth.id
    });

    this.logger.info('User has been logged out', {
      id: req.auth.sub
    });
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.json({
      status: EStatus.SUCCESS,
      message: 'You have been logged out'
    });
  }
}
