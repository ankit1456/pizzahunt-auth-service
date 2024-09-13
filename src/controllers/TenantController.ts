import { NextFunction, Request, Response } from 'express';
import { matchedData, validationResult } from 'express-validator';
import { Logger } from 'winston';
import { TenantService } from '../services';
import { EStatus, TQueryParams } from '../types';
import {
  TCreateTenantRequest,
  TUpdateTenantRequest
} from '../types/tenant.types';
import { NotFoundError, ValidationError } from '../utils/errors';

export default class TenantController {
  constructor(
    private tenantService: TenantService,
    private logger: Logger
  ) {
    this.createTenant = this.createTenant.bind(this);
    this.getAllTenants = this.getAllTenants.bind(this);
    this.getTenantById = this.getTenantById.bind(this);
    this.updateTenant = this.updateTenant.bind(this);
    this.deleteTenant = this.deleteTenant.bind(this);
  }

  async createTenant(
    req: TCreateTenantRequest,
    res: Response,
    next: NextFunction
  ) {
    this.logger.debug('Creating a tenant', req.body);

    const result = validationResult(req);

    if (!result.isEmpty()) return next(new ValidationError(result.array()));

    const { name, address } = req.body;

    const newTenant = await this.tenantService.createTenant({
      name,
      address
    });
    this.logger.info('Tenant has been created', {
      id: newTenant.id
    });
    res.status(201).json({ status: EStatus.SUCCESS, tenant: newTenant });
  }

  async getAllTenants(req: Request, res: Response, next: NextFunction) {
    const queryParams = matchedData(req, {
      onlyValidData: true
    }) as TQueryParams;

    const tenants = await this.tenantService.getAllTenants(queryParams);
    this.logger.info('Fetched all tenants');

    res.json({ status: EStatus.SUCCESS, ...tenants });
  }

  async getTenantById(req: Request, res: Response, next: NextFunction) {
    const result = validationResult(req);

    if (!result.isEmpty()) return next(new ValidationError(result.array()));

    const { tenantId } = req.params;
    const tenant = await this.tenantService.getTenantById(tenantId);

    if (!tenant) return next(new NotFoundError('Tenant not found'));

    this.logger.debug('Tenant fetched', {
      id: tenant.id
    });

    res.json({ status: EStatus.SUCCESS, tenant });
  }

  async updateTenant(
    req: TUpdateTenantRequest,
    res: Response,
    next: NextFunction
  ) {
    const result = validationResult(req);
    if (!result.isEmpty()) return next(new ValidationError(result.array()));

    const { tenantId } = req.params;

    const isExists = await this.tenantService.getTenantById(tenantId);

    if (!isExists) return next(new NotFoundError('Tenant not found'));

    const { name, address } = req.body;

    await this.tenantService.updateTenant(tenantId, {
      name,
      address
    });

    this.logger.info('Tenant updated', {
      id: tenantId
    });

    res.json({ status: EStatus.SUCCESS, id: tenantId });
  }

  async deleteTenant(req: Request, res: Response, next: NextFunction) {
    const result = validationResult(req);

    if (!result.isEmpty()) return next(new ValidationError(result.array()));

    const { tenantId } = req.params;

    const isExists = await this.tenantService.getTenantById(tenantId);

    if (!isExists) return next(new NotFoundError('Tenant not found'));

    const response = await this.tenantService.deleteTenant(tenantId);

    this.logger.info('Tenant deleted', {
      id: tenantId
    });
    if (response.affected) {
      res.json({ status: EStatus.SUCCESS });
    }
  }
}
