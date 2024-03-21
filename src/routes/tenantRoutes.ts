import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response
} from 'express';
import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';
import { TenantController } from '../controllers/TenantController';
import { Tenant } from '../entity/Tenant';
import { authenticate, canAccess } from '../middlewares';
import { Roles } from '../types/auth.types';
import tenantValidator, {
  updateTenantValidator,
  validateTenantID
} from '../validators/tenant.validator';
import { TenantService } from './../services';

const router = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);

const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.get('/', (async (req: Request, res: Response, next: NextFunction) =>
  tenantController.getAllTenants(req, res, next)) as RequestHandler);

router.use(authenticate as RequestHandler, canAccess(Roles.ADMIN));

router.get('/:tenantId', validateTenantID, (async (
  req: Request,
  res: Response,
  next: NextFunction
) => tenantController.getTenantById(req, res, next)) as RequestHandler);

router.post('/', tenantValidator, (async (
  req: Request,
  res: Response,
  next: NextFunction
) => tenantController.createTenant(req, res, next)) as RequestHandler);

router.patch('/:tenantId', validateTenantID, updateTenantValidator, (async (
  req: Request,
  res: Response,
  next: NextFunction
) => tenantController.updateTenant(req, res, next)) as RequestHandler);

router.delete('/:tenantId', validateTenantID, (async (
  req: Request,
  res: Response,
  next: NextFunction
) => tenantController.deleteTenant(req, res, next)) as RequestHandler);

export default router;
