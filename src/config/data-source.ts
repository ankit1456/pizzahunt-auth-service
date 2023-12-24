import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entity/User';
import { Config } from '.';

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = Config;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: false,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: []
});
