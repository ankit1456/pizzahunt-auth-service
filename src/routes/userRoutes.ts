import { AppDataSource, logger } from '@config';
import { UserController } from '@controllers';
import { User } from '@entity';
import { authenticate, canAccess, sanitizeRequest } from '@middlewares';
import { CredentialService, UserService } from '@services';
import { catchAsync } from '@utils';
import { ERoles } from '@utils/constants';
import {
  idValidator,
  queryParamsValidator,
  updateUserValidator,
  userValidator
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
  .post(userValidator, sanitizeRequest, catchAsync(userController.createUser));

router
  .route('/:userId')
  .get(
    idValidator('userId'),
    sanitizeRequest,
    catchAsync(userController.getUser)
  )
  .patch(
    idValidator('userId'),
    updateUserValidator,
    sanitizeRequest,
    catchAsync(userController.updateUser)
  )
  .delete(
    idValidator('userId'),
    sanitizeRequest,
    catchAsync(userController.deleteUser)
  );

export default router;
