import { SelectQueryBuilder } from 'typeorm';
import { Tenant } from '../entity/Tenant';
import { User } from '../entity/User';
import { TPaginatedQuery } from '../types';

export async function paginate<T extends User | Tenant>(
  queryBuilder: SelectQueryBuilder<T>,
  { page, limit }: TPaginatedQuery
) {
  const skip = (page - 1) * limit;
  const [data, totalCount] = await queryBuilder
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  return { page, limit, totalCount, data };
}
