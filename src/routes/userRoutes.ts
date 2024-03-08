import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response
} from 'express';
import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';
import { UserController } from '../controllers/UserController';
import { User } from '../entity/User';
import { authenticate, canAccess } from '../middlewares';
import { CredentialService, UserService } from '../services';
import { IUpdateUserRequest, Roles } from '../types';
import userValidator, {
  updateUserValidator,
  validateUserId
} from '../validators/user.validator';

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);

const credentialService = new CredentialService();
const userService = new UserService(userRepository, credentialService, logger);
const userController = new UserController(userService, logger);

router.get('/', authenticate as RequestHandler, canAccess(Roles.ADMIN), (async (
  req: Request,
  res: Response,
  next: NextFunction
) => userController.getAllUsers(req, res, next)) as RequestHandler);

router.get(
  '/:userId',
  authenticate as RequestHandler,
  canAccess(Roles.ADMIN),
  validateUserId,
  (async (req: Request, res: Response, next: NextFunction) =>
    userController.getUser(req, res, next)) as RequestHandler
);

router.post(
  '/',
  authenticate as RequestHandler,
  canAccess(Roles.ADMIN),
  userValidator,
  (async (req: Request, res: Response, next: NextFunction) =>
    userController.createUser(req, res, next)) as RequestHandler
);

router.patch(
  '/:userId',
  authenticate as RequestHandler,
  canAccess(Roles.ADMIN),
  validateUserId,
  updateUserValidator,
  (async (req: Request, res: Response, next: NextFunction) =>
    userController.updateUser(
      req as IUpdateUserRequest,
      res,
      next
    )) as RequestHandler
);
router.delete(
  '/:userId',
  authenticate as RequestHandler,
  canAccess(Roles.ADMIN),
  validateUserId,
  (async (req: Request, res: Response, next: NextFunction) =>
    userController.deleteUser(req, res, next)) as RequestHandler
);

export default router;
