import { TenantService } from './../services/TenantService';
import express, { NextFunction, Request, Response } from 'express';
import { TenantController } from '../controllers/TenantController';
import { AppDataSource } from '../config/data-source';
import { Tenant } from '../entity/Tenant';
import logger from '../config/logger';
import authenticate from '../middlewares/authenticate';
import { canAccess } from '../middlewares/canAccess';
import { Roles } from '../types/roles.enum';

const router = express();

const tenantRepository = AppDataSource.getRepository(Tenant);

const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.get(
  '/',
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.getAllTenants(req, res, next)
);

router.post(
  '/',
  authenticate,
  canAccess(Roles.ADMIN),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.createTenant(req, res, next)
);

export default router;
