import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { Logger } from 'winston';
import { TenantService } from '../services/TenantService';
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

  async getTenantById(req: Request, res: Response, next: NextFunction) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({
        errors: result.array()
      });
    }
    try {
      const { tenantId } = req.params;
      const tenant = await this.tenantService.getTenantById(tenantId);

      if (!tenant) {
        throw createHttpError(404, 'Tenant not found');
      }

      res.json(tenant);
    } catch (error) {
      return next(error);
    }
  }
}
