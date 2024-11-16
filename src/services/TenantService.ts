import { TQueryParams } from '@customTypes/common';
import { TTenant } from '@customTypes/tenant.types';
import { Tenant } from '@entity';
import { paginate } from '@utils';
import { Repository, SelectQueryBuilder } from 'typeorm';

export default class TenantService {
  constructor(private readonly tenantRepository: Repository<Tenant>) {}

  create(tenant: TTenant) {
    return this.tenantRepository.save(tenant);
  }

  getAll(queryParams: TQueryParams) {
    let queryBuilder = this.tenantRepository.createQueryBuilder('tenant');

    queryBuilder = this.search(queryBuilder, queryParams);
    return paginate<Tenant>(queryBuilder, queryParams);
  }
  findOne(tenantId: string | undefined) {
    return this.tenantRepository.findOneBy({ id: tenantId });
  }

  update(tenantId: string | undefined, tenantUpdatePayload: TTenant) {
    return this.tenantRepository.update({ id: tenantId }, tenantUpdatePayload);
  }

  delete(tenantId: string | undefined) {
    return this.tenantRepository.delete({ id: tenantId });
  }

  search(queryBuilder: SelectQueryBuilder<Tenant>, queryParams: TQueryParams) {
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
