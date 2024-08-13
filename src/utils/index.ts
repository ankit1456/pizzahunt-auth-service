import bcrypt from 'bcryptjs';
import { AppDataSource, Config, logger } from '../config';
import { User } from '../entity';
import { ERoles } from '../types/auth.types';

export async function createAdmin() {
  try {
    const userRespository = AppDataSource.getRepository(User);

    const ifExists = await userRespository.findOneBy({ role: ERoles.ADMIN });

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
      role: ERoles.ADMIN,
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

export { default as catchAsync } from './catchAsync';
export { default as paginate } from './paginate';
