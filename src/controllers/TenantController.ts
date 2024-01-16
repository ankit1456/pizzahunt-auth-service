import { NextFunction, Request, Response } from 'express';
import { TenantService } from '../services/TenantService';
import { Logger } from 'winston';
import { CreateTenantRequest } from '../types/tenant.types';

export class TenantController {
  constructor(
    private tenantService: TenantService,
    private logger: Logger
  ) {}

  async createTenant(
    req: CreateTenantRequest,
    res: Response,
    next: NextFunction
  ) {
    this.logger.debug('Request for creating a tenant', req.body);

    try {
      const { name, address } = req.body;

      const newTenant = await this.tenantService.createTenant({
        name,
        address
      });
      this.logger.info('Tenant has been created', {
        id: newTenant.id
      });
      res.status(201).json(newTenant);
    } catch (error) {
      return next(error);
    }
  }

  async getAllTenants(req: Request, res: Response, next: NextFunction) {
    try {
      const tenants = await this.tenantService.getAllTenants();

      res.json(tenants);
    } catch (error) {
      return next(error);
    }
  }
}
