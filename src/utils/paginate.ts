import { SelectQueryBuilder } from 'typeorm';
import { Tenant, User } from '../entity';
import { TQueryParams } from '../types';

export async function paginate<T extends User | Tenant>(
  queryBuilder: SelectQueryBuilder<T>,
  { page, limit }: TQueryParams
) {
  const skip = (page - 1) * limit;

  const [data, totalCount] = await queryBuilder
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  return { page, limit, totalCount, data };
}
