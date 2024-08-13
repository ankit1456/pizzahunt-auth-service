import express from 'express';
import { AppDataSource, logger } from '../config';
import { AuthController } from '../controllers';
import { RefreshToken, User } from '../entity';

import {
  authenticate,
  parseRefreshToken,
  validateRefreshToken
} from '../middlewares';
import { CredentialService, TokenService, UserService } from '../services';
import { catchAsync } from '../utils';
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

router.post(
  '/register',
  registerValidator,
  catchAsync(authController.register)
);

router.post('/login', loginValidator, catchAsync(authController.login));

router.post(
  '/refresh',
  validateRefreshToken,
  catchAsync(authController.refresh)
);

router.use(authenticate);

router.get('/self', catchAsync(authController.self));

router.post('/logout', parseRefreshToken, catchAsync(authController.logout));

export default router;
