import { DataSource, Repository } from 'typeorm';
import { Tenant } from '../../src/entity/Tenant';

export const truncateTables = async (connection: DataSource) => {
  const entities = connection.entityMetadatas;

  for (const entity of entities) {
    const respository = connection.getRepository(entity.name);
    await respository.clear();
  }
};

export const isJwt = (token: string | null): boolean => {
  if (!token) return false;

  const parts = token.split('.');

  if (parts.length !== 3) {
    return false;
  }

  try {
    for (const part of parts) {
      Buffer.from(part, 'base64').toString('utf-8');
    }
  } catch (error) {
    return false;
  }

  return true;
};

export const createTenant = async (repository: Repository<Tenant>) => {
  const tenant = await repository.save({
    name: 'Tenant name',
    address: 'Tenant address'
  });

  return tenant;
};
