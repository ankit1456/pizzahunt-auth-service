import express, { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';
import { AuthController } from '../controllers/AuthController';
import { RefreshToken } from '../entity/RefreshToken';
import { User } from '../entity/User';
import { TokenService } from '../services/TokenService';
import { UserService } from '../services/UserService';
import registerValidator from '../validators/register.validator';
import loginValidator from '../validators/login.validator';
import { CredentialService } from '../services/CredentialService';

const router = express();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);

const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);

const credentialService = new CredentialService();

const authController = new AuthController(
  userService,
  tokenService,
  credentialService,
  logger
);

router.post(
  '/register',
  registerValidator,
  (req: Request, res: Response, next: NextFunction) =>
    authController.register(req, res, next)
);
router.post(
  '/login',
  loginValidator,
  (req: Request, res: Response, next: NextFunction) =>
    authController.login(req, res, next)
);

export default router;
