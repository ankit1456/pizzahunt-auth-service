import express, { RequestHandler } from 'express';
import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';
import { AuthController } from '../controllers';
import { RefreshToken, User } from '../entity';

import {
  authenticate,
  parseRefreshToken,
  validateRefreshToken
} from '../middlewares';
import { CredentialService, TokenService, UserService } from '../services';
import { TAuthRequest } from '../types/auth.types';
import loginValidator from '../validators/login.validator';
import registerValidator from '../validators/register.validator';

const router = express.Router();

const credentialService = new CredentialService();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository, credentialService, logger);

const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);

const authController = new AuthController(
  userService,
  tokenService,
  credentialService,
  logger
);

router.post('/register', registerValidator, (async (req, res, next) =>
  authController.register(req, res, next)) as RequestHandler);

router.post('/login', loginValidator, (async (req, res, next) =>
  authController.login(req, res, next)) as RequestHandler);

router.get(
  '/self',
  authenticate as RequestHandler,
  (async (req, res, next) =>
    authController.self(req as TAuthRequest, res, next)) as RequestHandler
);

router.post(
  '/refresh',
  validateRefreshToken as RequestHandler,
  (async (req, res, next) =>
    authController.refresh(req as TAuthRequest, res, next)) as RequestHandler
);

router.post(
  '/logout',
  authenticate as RequestHandler,
  parseRefreshToken as RequestHandler,
  (async (req, res, next) =>
    authController.logout(req as TAuthRequest, res, next)) as RequestHandler
);

export default router;
