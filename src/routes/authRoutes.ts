import express, { RequestHandler } from 'express';
import { AppDataSource, logger } from '../config';
import { AuthController } from '../controllers';
import { RefreshToken, User } from '../entity';

import {
  authenticate,
  parseRefreshToken,
  validateRefreshToken
} from '../middlewares';
import { CredentialService, TokenService, UserService } from '../services';
import { AuthRoutes, TAuthRequest } from '../types/auth.types';
import { loginValidator, registerValidator } from '../validators';

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

router.post(AuthRoutes.REGISTER, registerValidator, ((req, res, next) =>
  authController.register(req, res, next)) as RequestHandler);

router.post(AuthRoutes.LOGIN, loginValidator, ((req, res, next) =>
  authController.login(req, res, next)) as RequestHandler);

router.post(
  AuthRoutes.REFRESH,
  validateRefreshToken as RequestHandler,
  ((req, res, next) =>
    authController.refresh(req as TAuthRequest, res, next)) as RequestHandler
);

router.use(authenticate as RequestHandler);

router.get(AuthRoutes.SELF, ((req, res, next) =>
  authController.self(req as TAuthRequest, res, next)) as RequestHandler);

router.post(
  AuthRoutes.LOGOUT,
  parseRefreshToken as RequestHandler,
  ((req, res, next) =>
    authController.logout(req as TAuthRequest, res, next)) as RequestHandler
);

export default router;
