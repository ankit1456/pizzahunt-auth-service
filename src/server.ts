import bcrypt from 'bcryptjs';
import logger from './config/logger';
import app from './app';
import { Config } from './config';
import { AppDataSource } from './config/data-source';
import { Server } from 'http';
import { User } from './entity/User';
import { Roles } from './types/auth.types';

process.on('uncaughtException', (err) => {
  logger.info('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.message, { errorName: err.name });
  process.exit(1);
});

let server: Server;
const startServer = async () => {
  const { PORT, NODE_ENV } = Config;

  try {
    await AppDataSource.initialize();
    logger.info('Database connected successfully 😊');

    if (NODE_ENV !== 'test') {
      await createAdmin();
    }

    server = app.listen(PORT, () =>
      logger.info(`Server running on port ${PORT}`, {
        success: 'Server started successfully 😊😊'
      })
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AggregateError') {
        logger.error('Database connection failed 😟😟', {
          errorName: error.name
        });
      } else {
        logger.error(error.message, {
          errorName: error.name
        });
      }
    }
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }
};

void startServer();

async function createAdmin() {
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

process.on('unhandledRejection', (err: Error) => {
  logger.error(err.message, { errorName: err.name });
  logger.info('UnhandledRejection , shutting down 😶');
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM RECIEVED, shutting down gracefully 👋');
  server.close((error) => {
    logger.error('💥 Process Terminated', {
      errorName: error?.name
    });
  });
});
