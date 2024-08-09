import express, { RequestHandler } from 'express';
import { AppDataSource, logger } from '../config';
import { TenantController } from '../controllers';
import { Tenant } from '../entity';
import { authenticate, canAccess } from '../middlewares';
import { ERoles } from '../types/auth.types';
import {
  queryParamsValidator,
  tenantValidator,
  updateTenantValidator,
  validateTenantId
} from '../validators';

import { TenantService } from './../services';

const router = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);

const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.get('/', queryParamsValidator, ((req, res, next) =>
  tenantController.getAllTenants(req, res, next)) as RequestHandler);

router.use(authenticate as RequestHandler, canAccess(ERoles.ADMIN));

router.post('/', tenantValidator, ((req, res, next) =>
  tenantController.createTenant(req, res, next)) as RequestHandler);

router
  .route('/:tenantId')
  .get(validateTenantId, ((req, res, next) =>
    tenantController.getTenantById(req, res, next)) as RequestHandler)
  .patch(validateTenantId, updateTenantValidator, ((req, res, next) =>
    tenantController.updateTenant(req, res, next)) as RequestHandler)
  .delete(validateTenantId, ((req, res, next) =>
    tenantController.deleteTenant(req, res, next)) as RequestHandler);

export default router;
