import express, { RequestHandler } from 'express';
import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';
import { UserController } from '../controllers/UserController';
import { User } from '../entity/User';
import { authenticate, canAccess } from '../middlewares';
import { CredentialService, UserService } from '../services';
import { Roles, TUpdateUserRequest } from '../types/auth.types';
import paginationValidator from '../validators/pagination.validator';
import userValidator, {
  updateUserValidator,
  validateUserId
} from '../validators/user.validator';

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);

const credentialService = new CredentialService();
const userService = new UserService(userRepository, credentialService, logger);
const userController = new UserController(userService, logger);

router.get(
  '/',
  authenticate as RequestHandler,
  canAccess(Roles.ADMIN),
  paginationValidator,
  (async (req, res, next) =>
    userController.getAllUsers(req, res, next)) as RequestHandler
);

router.get(
  '/:userId',
  authenticate as RequestHandler,
  canAccess(Roles.ADMIN),
  validateUserId,
  (async (req, res, next) =>
    userController.getUser(req, res, next)) as RequestHandler
);

router.post(
  '/',
  authenticate as RequestHandler,
  canAccess(Roles.ADMIN),
  userValidator,
  (async (req, res, next) =>
    userController.createUser(req, res, next)) as RequestHandler
);

router.patch(
  '/:userId',
  authenticate as RequestHandler,
  canAccess(Roles.ADMIN),
  validateUserId,
  updateUserValidator,
  (async (req, res, next) =>
    userController.updateUser(
      req as TUpdateUserRequest,
      res,
      next
    )) as RequestHandler
);
router.delete(
  '/:userId',
  authenticate as RequestHandler,
  canAccess(Roles.ADMIN),
  validateUserId,
  (async (req, res, next) =>
    userController.deleteUser(req, res, next)) as RequestHandler
);

export default router;
