import { TenantService } from './../services/TenantService';
import express, { NextFunction, Request, Response } from 'express';
import { TenantController } from '../controllers/TenantController';
import { AppDataSource } from '../config/data-source';
import { Tenant } from '../entity/Tenant';
import logger from '../config/logger';
import { CreateTenantRequest } from '../types/tenant.types';
import authenticate from '../middlewares/authenticate';

const router = express();

const tenantRepository = AppDataSource.getRepository(Tenant);

const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.post(
  '/',
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.createTenant(req as CreateTenantRequest, res, next)
);

export default router;
