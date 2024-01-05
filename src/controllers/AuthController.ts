import { NextFunction, Response } from 'express';
import { validationResult } from 'express-validator';
import fs from 'fs';
import createHttpError from 'http-errors';
import { JwtPayload, sign } from 'jsonwebtoken';
import path from 'path';
import util from 'util';
import { Logger } from 'winston';
import { Config } from '../config';
import { UserService } from '../services/UserService';
import { RegisterUserRequest } from '../types';
export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({
        errors: result.array()
      });
    }
    const { firstName, lastName, email, password, role } = req.body;

    this.logger.debug('Request initiated for registering user', {
      firstName,
      lastName,
      email,
      password: '*******',
      role
    });
    try {
      const newUser = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role
      });
      this.logger.info('User has been registered', { id: newUser.id });

      let privateKey: Buffer;

      const readFile = util.promisify(fs.readFile);
      try {
        privateKey = await readFile(
          path.join(__dirname, '../../certs/private.pem')
        );
      } catch (err) {
        const error = createHttpError(
          500,
          'Exception while reading private key'
        );
        return next(error);
      }
      const payload: JwtPayload = {
        sub: newUser.id,
        role: newUser.role
      };
      const accessToken = sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: Config.JWT_EXPIRES_IN,
        issuer: Config.SERVICE_NAME
      });
      const refreshToken = 'sefwfe';

      res.cookie('accessToken', accessToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60, //1h
        httpOnly: true
      });
      res.cookie('refreshToken', refreshToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 365,
        httpOnly: true
      });

      res.status(201).json(newUser);
    } catch (error) {
      return next(error);
    }
  }
}
