import { AppDataSource, logger } from '@config';
import { UserController } from '@controllers';
import { ERoles } from '@customTypes/auth.types';
import { User } from '@entity';
import { authenticate, canAccess } from '@middlewares';
import { CredentialService, UserService } from '@services';
import { catchAsync } from '@utils';
import {
  queryParamsValidator,
  updateUserValidator,
  userValidator,
  validateUserId
} from '@validators';
import express from 'express';

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);

const credentialService = new CredentialService();
const userService = new UserService(userRepository, credentialService);
const userController = new UserController(userService, logger);

router.use(authenticate, canAccess(ERoles.ADMIN));

router
  .route('/')
  .get(queryParamsValidator, catchAsync(userController.getAllUsers))
  .post(userValidator, catchAsync(userController.createUser));

router
  .route('/:userId')
  .get(validateUserId, catchAsync(userController.getUser))
  .patch(
    validateUserId,
    updateUserValidator,
    catchAsync(userController.updateUser)
  )
  .delete(validateUserId, catchAsync(userController.deleteUser));

export default router;
