import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response
} from 'express';
import { AppDataSource } from '../config/data-source';
import { UserController } from '../controllers/UserController';
import { User } from '../entity/User';
import authenticate from '../middlewares/authenticate';
import { canAccess } from '../middlewares/canAccess';
import { CredentialService } from '../services/CredentialService';
import { UserService } from '../services/UserService';
import { Roles } from '../types/roles.enum';
import userValidator from '../validators/user.validator';

const router = express();

const userRepository = AppDataSource.getRepository(User);

const credentialService = new CredentialService();
const userService = new UserService(userRepository, credentialService);
const userController = new UserController(userService);

router.get(
  '/',
  authenticate as RequestHandler,
  canAccess(Roles.ADMIN),
  (req: Request, res: Response, next: NextFunction) =>
    userController.getAllUsers(req, res, next)
);

router.post(
  '/',
  authenticate as RequestHandler,
  canAccess(Roles.ADMIN),
  userValidator,
  (req: Request, res: Response, next: NextFunction) =>
    userController.createUser(req, res, next)
);

export default router;
