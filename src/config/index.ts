import { config } from 'dotenv';
import path from 'path';

// jest automatically sets NODE_ENV as test
config({ path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`) });

const {
  PORT,
  NODE_ENV,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  SERVICE_NAME,
  JWT_EXPIRES_IN
} = process.env;

export const Config = {
  PORT,
  NODE_ENV,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  SERVICE_NAME,
  JWT_EXPIRES_IN
};
