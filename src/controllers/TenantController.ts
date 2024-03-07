import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { Logger } from 'winston';
import { TenantService } from '../services';
import {
  ICreateTenantRequest,
  IUpdateTenantRequest
} from '../types/tenant.types';

export class TenantController {
  constructor(
    private tenantService: TenantService,
    private logger: Logger
  ) {}

  async createTenant(
    req: ICreateTenantRequest,
    res: Response,
    next: NextFunction
  ) {
    this.logger.debug('Creating a tenant', req.body);

    try {
      const result = validationResult(req);

      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }

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
      this.logger.info('All tenants fetched');

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
        throw createHttpError(404, `Tenant not found`);
      }

      this.logger.debug('Tenant fetched', {
        id: tenant.id
      });

      res.json(tenant);
    } catch (error) {
      return next(error);
    }
  }

  async updateTenant(
    req: IUpdateTenantRequest,
    res: Response,
    next: NextFunction
  ) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({
        errors: result.array()
      });
    }
    try {
      const { tenantId } = req.params;

      const isExists = await this.tenantService.getTenantById(tenantId);

      if (!isExists) {
        throw createHttpError(404, 'Tenant not found');
      }
      const { name, address } = req.body;

      await this.tenantService.updateTenant(tenantId, {
        name,
        address
      });

      this.logger.info('Tenant updated', {
        id: tenantId
      });

      res.json({ id: tenantId });
    } catch (error) {
      return next(error);
    }
  }

  async deleteTenant(req: Request, res: Response, next: NextFunction) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({
        errors: result.array()
      });
    }

    try {
      const { tenantId } = req.params;

      const isExists = await this.tenantService.getTenantById(tenantId);

      if (!isExists) {
        throw createHttpError(404, `Tenant not found`);
      }

      const result = await this.tenantService.deleteTenant(tenantId);

      this.logger.info('Tenant deleted', {
        id: tenantId
      });
      if (result.affected) {
        res.json({ message: 'Tenant deleted' });
      }
    } catch (error) {
      return next(error);
    }
  }
}
