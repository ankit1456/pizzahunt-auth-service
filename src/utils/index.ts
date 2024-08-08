import bcrypt from 'bcryptjs';
import { SelectQueryBuilder } from 'typeorm';
import { AppDataSource, Config, logger } from '../config';
import { Tenant, User } from '../entity';
import { TQueryParams } from '../types';
import { Roles } from '../types/auth.types';

export async function createAdmin() {
  try {
    const userRespository = AppDataSource.getRepository(User);

    const ifExists = await userRespository.findOneBy({ role: Roles.ADMIN });

    if (ifExists) return;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      Config.ADMIN_DEFAULT_PASSWORD!,
      saltRounds
    );

    await userRespository.save({
      firstName: Config.ADMIN_DEFAULT_FIRSTNAME,
      lastName: Config.ADMIN_DEFAULT_LASTNAME,
      email: Config.ADMIN_DEFAULT_EMAIL,
      role: Roles.ADMIN,
      password: hashedPassword
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error('default Admin user creation failed', {
        errorName: error.name
      });
    }
  }
}

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
