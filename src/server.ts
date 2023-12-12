import logger from './config/logger';
import app from './app';
import { Config } from './config';

const startServer = () => {
  const { PORT } = Config;

  try {
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

startServer();
