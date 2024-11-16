import { TQueryParams } from '@customTypes/common';
import {
  TCreateTenantRequest,
  TUpdateTenantRequest
} from '@customTypes/tenant.types';
import { TenantService } from '@services';
import { EStatus } from '@utils/constants';
import { NotFoundError } from '@utils/errors';
import { NextFunction, Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { Logger } from 'winston';

export default class TenantController {
  constructor(
    private readonly tenantService: TenantService,
    private readonly logger: Logger
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
    const { name, address } = req.body;
    this.logger.debug('Creating a tenant', {
      name,
      address
    });

    const newTenant = await this.tenantService.create({
      name,
      address
    });
    this.logger.info('Tenant has been created', {
      id: newTenant.id
    });
    res.status(201).json({ status: EStatus.SUCCESS, tenant: newTenant });
  }

  async getAllTenants(req: Request, res: Response, next: NextFunction) {
    const queryParams = matchedData<TQueryParams>(req, {
      onlyValidData: true
    });

    const tenants = await this.tenantService.getAll(queryParams);
    this.logger.info('Fetched all tenants');

    res.json({ status: EStatus.SUCCESS, ...tenants });
  }

  async getTenantById(req: Request, res: Response, next: NextFunction) {
    const { tenantId } = req.params;
    const tenant = await this.tenantService.findOne(tenantId);

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
    const { tenantId } = req.params;

    const isExists = await this.tenantService.findOne(tenantId);

    if (!isExists) return next(new NotFoundError('Tenant not found'));

    const { name, address } = req.body;

    await this.tenantService.update(tenantId, {
      name,
      address
    });

    this.logger.info('Tenant updated', {
      id: tenantId
    });

    res.json({ status: EStatus.SUCCESS, id: tenantId });
  }

  async deleteTenant(req: Request, res: Response, next: NextFunction) {
    const { tenantId } = req.params;

    const isExists = await this.tenantService.findOne(tenantId);

    if (!isExists) return next(new NotFoundError('Tenant not found'));

    const response = await this.tenantService.delete(tenantId);

    this.logger.info('Tenant deleted', {
      id: tenantId
    });
    if (response.affected) {
      res.json({ status: EStatus.SUCCESS });
    }
  }
}
