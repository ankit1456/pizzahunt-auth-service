import { Repository } from 'typeorm';
import { Tenant } from '../entity/Tenant';
import { ITenant } from '../types/tenant.types';

export class TenantService {
  constructor(private tenantRepository: Repository<Tenant>) {}

  createTenant(tenant: ITenant) {
    return this.tenantRepository.save(tenant);
  }

  getAllTenants() {
    return this.tenantRepository.find();
  }
  getTenantById(tenantId: string | undefined) {
    return this.tenantRepository.findOneBy({ id: tenantId });
  }

  updateTenant(tenantId: string | undefined, tenant: ITenant) {
    return this.tenantRepository.update({ id: tenantId }, tenant);
  }

  deleteTenant(tenantId: string | undefined) {
    return this.tenantRepository.delete({ id: tenantId });
  }
}
