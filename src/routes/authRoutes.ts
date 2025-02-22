import { AppDataSource, logger } from '@config';
import { AuthController } from '@controllers';
import { RefreshToken, User } from '@entity';
import express from 'express';

import {
  authenticate,
  parseRefreshToken,
  sanitizeRequest,
  validateRefreshToken
} from '@middlewares';
import { CredentialService, TokenService, UserService } from '@services';
import { catchAsync } from '@utils';
import { loginValidator, registerValidator } from '@validators';

const router = express.Router();

const credentialService = new CredentialService();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository, credentialService);

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
  sanitizeRequest,
  catchAsync(authController.register)
);

router.post(
  '/login',
  loginValidator,
  sanitizeRequest,
  catchAsync(authController.login)
);

router.post(
  '/refresh',
  validateRefreshToken,
  sanitizeRequest,
  catchAsync(authController.refresh)
);

router.use(authenticate);

router.get('/self', catchAsync(authController.self));

router.post('/logout', parseRefreshToken, catchAsync(authController.logout));

export default router;
