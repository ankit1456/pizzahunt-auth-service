import { Repository, SelectQueryBuilder } from 'typeorm';
import { Tenant } from '../entity';
import { TQueryParams } from '../types';
import { TTenant } from '../types/tenant.types';
import { paginate } from '../utils';

export default class TenantService {
  constructor(private readonly tenantRepository: Repository<Tenant>) {}

  createTenant(tenant: TTenant) {
    return this.tenantRepository.save(tenant);
  }

  getAllTenants(queryParams: TQueryParams) {
    let queryBuilder = this.tenantRepository.createQueryBuilder('tenant');

    queryBuilder = this.searchTenants(queryBuilder, queryParams);
    return paginate<Tenant>(queryBuilder, queryParams);
  }
  getTenantById(tenantId: string | undefined) {
    return this.tenantRepository.findOneBy({ id: tenantId });
  }

  updateTenant(tenantId: string | undefined, tenantUpdatePayload: TTenant) {
    return this.tenantRepository.update({ id: tenantId }, tenantUpdatePayload);
  }

  deleteTenant(tenantId: string | undefined) {
    return this.tenantRepository.delete({ id: tenantId });
  }

  searchTenants(
    queryBuilder: SelectQueryBuilder<Tenant>,
    queryParams: TQueryParams
  ) {
    if (queryParams.q) {
      const searchTerm = `%${queryParams.q}%`;

      queryBuilder
        .where("CONCAT(tenant.name, ' ', tenant.address) ILike :q", {
          q: searchTerm
        })
        .orWhere('CONCAT(tenant.name, tenant.address) ILike :q', {
          q: searchTerm
        });
    }

    return queryBuilder.orderBy('tenant.createdAt', 'DESC');
  }
}
