import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { TQueryParams } from '@customTypes/common';

async function paginate<T extends ObjectLiteral>(
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

export default paginate;
