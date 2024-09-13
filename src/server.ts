import { Server } from 'http';
import app from './app';
import { AppDataSource, Config, logger } from './config';
import { createAdmin } from './utils';

process.on('uncaughtException', (err) => {
  logger.info('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.message, { errorName: err.name });
  process.exit(1);
});

let server: Server;
const startServer = async () => {
  const { PORT = 4000, NODE_ENV } = Config;

  try {
    await AppDataSource.initialize();
    logger.info('Database connected successfully 😊');

    if (NODE_ENV !== 'test') await createAdmin();

    server = app.listen(PORT, () =>
      logger.info(`Auth Service running on port ${PORT}`, {
        success: 'Auth Service started successfully 😊😊'
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
