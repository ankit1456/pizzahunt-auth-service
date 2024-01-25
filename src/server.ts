import logger from './config/logger';
import app from './app';
import { Config } from './config';
import { AppDataSource } from './config/data-source';
import { Server } from 'http';

process.on('uncaughtException', (err) => {
  logger.info('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, { message: err.message });
  process.exit(1);
});

let server: Server;
const startServer = async () => {
  const { PORT } = Config;

  try {
    await AppDataSource.initialize();
    logger.info('Database connected successfully 😊');
    server = app.listen(PORT, () =>
      logger.info(`Server running on port ${PORT}`, {
        success: 'Server Started Successfully 😊😊'
      })
    );
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }
};

void startServer();

process.on('unhandledRejection', (err: Error) => {
  logger.error(err.name, { message: err.message });
  logger.info('UnhandledRejection , shutting down 😶');
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM RECIEVED ,Shutting down gracefully 👋');
  server.close(() => {
    logger.error('💥 Process Terminated');
  });
});
