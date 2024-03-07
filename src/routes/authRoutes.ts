import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response
} from 'express';
import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';
import { AuthController } from '../controllers/AuthController';
import { RefreshToken } from '../entity/RefreshToken';
import { User } from '../entity/User';
import {
  authenticate,
  parseRefreshToken,
  validateRefreshToken
} from '../middlewares';
import { CredentialService, TokenService, UserService } from '../services';
import { IAuthRequest } from '../types';
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

router.post('/register', registerValidator, (async (
  req: Request,
  res: Response,
  next: NextFunction
) => authController.register(req, res, next)) as RequestHandler);

router.post('/login', loginValidator, (async (
  req: Request,
  res: Response,
  next: NextFunction
) => authController.login(req, res, next)) as RequestHandler);

router.get(
  '/self',
  authenticate as RequestHandler,
  (async (req: Request, res: Response, next: NextFunction) =>
    authController.self(req as IAuthRequest, res, next)) as RequestHandler
);

router.post(
  '/refresh',
  validateRefreshToken as RequestHandler,
  (async (req: Request, res: Response, next: NextFunction) =>
    authController.refresh(req as IAuthRequest, res, next)) as RequestHandler
);

router.post(
  '/logout',
  authenticate as RequestHandler,
  parseRefreshToken as RequestHandler,
  (async (req: Request, res: Response, next: NextFunction) =>
    authController.logout(req as IAuthRequest, res, next)) as RequestHandler
);

export default router;
