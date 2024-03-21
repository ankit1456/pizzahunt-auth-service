import { Repository } from 'typeorm';
import { Tenant } from '../entity/Tenant';
import { TPartialTenant, TTenant } from '../types/tenant.types';

export class TenantService {
  constructor(private tenantRepository: Repository<Tenant>) {}

  createTenant(tenant: TTenant) {
    return this.tenantRepository.save(tenant);
  }

  getAllTenants() {
    return this.tenantRepository.find();
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
