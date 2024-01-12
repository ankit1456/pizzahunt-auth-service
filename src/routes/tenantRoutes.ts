import express, { NextFunction, Request, Response } from 'express';
import { TenantController } from '../controllers/TenantController';

const router = express();

const tenantController = new TenantController();

router.post('/', (req: Request, res: Response, next: NextFunction) =>
  tenantController.createTenant(req, res)
);

export default router;
