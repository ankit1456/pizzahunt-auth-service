import { Repository } from 'typeorm';
import { Tenant } from '../entity/Tenant';
import { CreateTenantDto } from '../types/tenant.types';

export class TenantService {
  constructor(private tenantRepository: Repository<Tenant>) {}

  createTenant(tenant: CreateTenantDto) {
    return this.tenantRepository.save(tenant);
  }
}
