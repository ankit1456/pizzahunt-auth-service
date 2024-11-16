import { AppDataSource, logger } from '@config';
import { TenantController } from '@controllers';
import { ERoles } from '@utils/constants';
import { Tenant } from '@entity';
import { authenticate, canAccess, sanitizeRequest } from '@middlewares';
import {
  idValidator,
  queryParamsValidator,
  tenantValidator,
  updateTenantValidator
} from '@validators';
import express from 'express';

import { TenantService } from '@services';
import { catchAsync } from '@utils';

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

router.post(
  '/',
  tenantValidator,
  sanitizeRequest,
  catchAsync(tenantController.createTenant)
);

router
  .route('/:tenantId')
  .get(
    idValidator('tenantId'),
    sanitizeRequest,
    catchAsync(tenantController.getTenantById)
  )
  .patch(
    idValidator('tenantId'),
    updateTenantValidator,
    sanitizeRequest,
    catchAsync(tenantController.updateTenant)
  )
  .delete(
    idValidator('tenantId'),
    sanitizeRequest,
    catchAsync(tenantController.deleteTenant)
  );

export default router;
