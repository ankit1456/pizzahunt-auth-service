import logger from './config/logger';
import app from './app';
import { Config } from './config';
import { AppDataSource } from './config/data-source';

const startServer = async () => {
  const { PORT } = Config;

  try {
    await AppDataSource.initialize();
    logger.info('Database connected successfully 😊');
    app.listen(PORT, () =>
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
