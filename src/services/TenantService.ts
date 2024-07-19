import { Repository } from 'typeorm';
import { Tenant } from '../entity';
import { TQueryParams } from '../types';
import { TPartialTenant, TTenant } from '../types/tenant.types';
import { paginate } from '../utils/paginate';

export default class TenantService {
  constructor(private tenantRepository: Repository<Tenant>) {}

  createTenant(tenant: TTenant) {
    return this.tenantRepository.save(tenant);
  }

  getAllTenants(queryParams: TQueryParams) {
    const queryBuilder = this.tenantRepository.createQueryBuilder();
    return paginate<Tenant>(queryBuilder, queryParams);
  }
  getTenantById(tenantId: string | undefined) {
    return this.tenantRepository.findOneBy({ id: tenantId });
  }

  updateTenant(
    tenantId: string | undefined,
    tenantUpdatePayload: TPartialTenant
  ) {
    return this.tenantRepository.update({ id: tenantId }, tenantUpdatePayload);
  }

  deleteTenant(tenantId: string | undefined) {
    return this.tenantRepository.delete({ id: tenantId });
  }
}
