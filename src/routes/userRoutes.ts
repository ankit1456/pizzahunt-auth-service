import express, { RequestHandler } from 'express';
import { AppDataSource, logger } from '../config';
import { UserController } from '../controllers';
import { User } from '../entity';
import { authenticate, canAccess } from '../middlewares';
import { CredentialService, UserService } from '../services';
import { ERoles, TUpdateUserRequest } from '../types/auth.types';
import {
  queryParamsValidator,
  updateUserValidator,
  userValidator,
  validateUserId
} from '../validators';

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);

const credentialService = new CredentialService();
const userService = new UserService(userRepository, credentialService, logger);
const userController = new UserController(userService, logger);

router.use(authenticate as RequestHandler, canAccess(ERoles.ADMIN));

router
  .route('/')
  .get(queryParamsValidator, ((req, res, next) =>
    userController.getAllUsers(req, res, next)) as RequestHandler)
  .post(userValidator, ((req, res, next) =>
    userController.createUser(req, res, next)) as RequestHandler);

router
  .route('/:userId')
  .get(validateUserId, ((req, res, next) =>
    userController.getUser(req, res, next)) as RequestHandler)
  .patch(validateUserId, updateUserValidator, ((req, res, next) =>
    userController.updateUser(
      req as TUpdateUserRequest,
      res,
      next
    )) as RequestHandler)
  .delete(validateUserId, ((req, res, next) =>
    userController.deleteUser(req, res, next)) as RequestHandler);

export default router;
