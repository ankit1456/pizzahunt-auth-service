import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response
} from 'express';
import { UserController } from '../controllers/UserController';
import authenticate from '../middlewares/authenticate';
import { canAccess } from '../middlewares/canAccess';
import { Roles } from '../types/roles.enum';
import { UserService } from '../services/UserService';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import { CredentialService } from '../services/CredentialService';
import userValidator from '../validators/user.validator';

const router = express();

const userRepository = AppDataSource.getRepository(User);

const credentialService = new CredentialService();
const userService = new UserService(userRepository, credentialService);
const userController = new UserController(userService);

router.post(
  '/',
  authenticate as RequestHandler,
  canAccess(Roles.ADMIN),
  userValidator,
  (req: Request, res: Response, next: NextFunction) =>
    userController.createUser(req, res, next)
);

export default router;
