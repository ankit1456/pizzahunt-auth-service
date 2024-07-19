import express, { RequestHandler } from 'express';
import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';
import { UserController } from '../controllers';
import { User } from '../entity';
import { authenticate, canAccess } from '../middlewares';
import { CredentialService, UserService } from '../services';
import { Roles, TUpdateUserRequest } from '../types/auth.types';
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

router.use(authenticate as RequestHandler, canAccess(Roles.ADMIN));

router.get('/', queryParamsValidator, (async (req, res, next) =>
  userController.getAllUsers(req, res, next)) as RequestHandler);

router.get('/:userId', validateUserId, (async (req, res, next) =>
  userController.getUser(req, res, next)) as RequestHandler);

router.post('/', userValidator, (async (req, res, next) =>
  userController.createUser(req, res, next)) as RequestHandler);

router.patch('/:userId', validateUserId, updateUserValidator, (async (
  req,
  res,
  next
) =>
  userController.updateUser(
    req as TUpdateUserRequest,
    res,
    next
  )) as RequestHandler);
router.delete('/:userId', validateUserId, (async (req, res, next) =>
  userController.deleteUser(req, res, next)) as RequestHandler);

export default router;
