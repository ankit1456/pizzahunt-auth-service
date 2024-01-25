import { HttpError } from 'http-errors';
import logger from '../config/logger';

export function logError(error: unknown, message: string) {
  if (error instanceof Error || error instanceof HttpError) {
    logger.error(message, {
      errorName: error.name,
      reason: error.message
    });
  }
}
