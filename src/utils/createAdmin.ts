import { AppDataSource, Config, logger } from '@config';
import { ERoles } from '@utils/constants';
import { User } from '@entity';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  try {
    const userRespository = AppDataSource.getRepository(User);

    const ifExists = await userRespository.findOneBy({ role: ERoles.ADMIN });

    if (ifExists) return;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      Config.ADMIN_DEFAULT_PASSWORD!,
      saltRounds
    );

    const adminUser = await userRespository.save({
      firstName: Config.ADMIN_DEFAULT_FIRSTNAME,
      lastName: Config.ADMIN_DEFAULT_LASTNAME,
      email: Config.ADMIN_DEFAULT_EMAIL,
      role: ERoles.ADMIN,
      password: hashedPassword
    });

    logger.info('Admin created', {
      email: adminUser.email,
      role: adminUser.role
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error('default Admin user creation failed', {
        errorName: error.name
      });
    }
  }
}

export default createAdmin;
