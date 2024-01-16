import express, { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';
import { TenantController } from '../controllers/TenantController';
import { Tenant } from '../entity/Tenant';
import authenticate from '../middlewares/authenticate';
import { canAccess } from '../middlewares/canAccess';
import { Roles } from '../types/roles.enum';
import { validateUUID } from '../validators/uuid.validator';
import { TenantService } from './../services/TenantService';

const router = express();

const tenantRepository = AppDataSource.getRepository(Tenant);

const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.get('/', (req: Request, res: Response, next: NextFunction) =>
  tenantController.getAllTenants(req, res, next)
);

router.get(
  '/:tenantId',
  authenticate,
  canAccess(Roles.ADMIN),
  validateUUID,
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.getTenantById(req, res, next)
);

router.post(
  '/',
  authenticate,
  canAccess(Roles.ADMIN),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.createTenant(req, res, next)
);

export default router;
