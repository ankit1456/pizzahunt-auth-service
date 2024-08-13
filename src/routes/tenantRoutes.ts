import express from 'express';
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

import { catchAsync } from '../utils';
import { TenantService } from './../services';

const router = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);

const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.get(
  '/',
  queryParamsValidator,
  catchAsync(tenantController.getAllTenants)
);

router.use(authenticate, canAccess(ERoles.ADMIN));

router.post('/', tenantValidator, catchAsync(tenantController.createTenant));

router
  .route('/:tenantId')
  .get(validateTenantId, catchAsync(tenantController.getTenantById))
  .patch(
    validateTenantId,
    updateTenantValidator,
    catchAsync(tenantController.updateTenant)
  )
  .delete(validateTenantId, catchAsync(tenantController.deleteTenant));

export default router;
