import { config } from 'dotenv';
import path from 'path';

// jest automatically sets NODE_ENV as test
config({
  path: path.resolve(__dirname, `../../.env.${process.env.NODE_ENV ?? 'dev'}`)
});

const envVariables = [
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'SERVICE_NAME',
  'ACCESS_TOKEN_EXPIRES_IN',
  'REFRESH_TOKEN_EXPIRES_IN',
  'REFRESH_TOKEN_SECRET',
  'JWKS_URI',
  'PRIVATE_KEY',
  'WHITELIST_ORIGIN',
  'ADMIN_DEFAULT_FIRSTNAME',
  'ADMIN_DEFAULT_LASTNAME',
  'ADMIN_DEFAULT_EMAIL',
  'ADMIN_DEFAULT_PASSWORD'
];

type ConfigType = {
  [key in (typeof envVariables)[number]]: string | undefined;
};

export const Config: ConfigType = envVariables.reduce(
  (acc, curr) => {
    if (process.env[curr]) acc[curr] = process.env[curr];

    return acc;
  },
  {} as Record<string, string | undefined>
);

export { default as logger } from './logger';
export { default as AppDataSource } from './data-source';
