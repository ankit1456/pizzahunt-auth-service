import bcrypt from 'bcryptjs';
import { JwtPayload, sign } from 'jsonwebtoken';
import { DataSource, Repository } from 'typeorm';
import { Config } from '../../src/config';
import { Tenant } from '../../src/entity/Tenant';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/types';

export const truncateTables = async (connection: DataSource) => {
  const entities = connection.entityMetadatas;

  for (const entity of entities) {
    const respository = connection.getRepository(entity.name);
    await respository.clear();
  }
};

export const isJwt = (token: string): boolean => {
  if (!token) return false;

  const parts = token.split('.');

  if (parts.length !== 3) {
    return false;
  }

  try {
    for (const part of parts) {
      Buffer.from(part, 'base64').toString('utf-8');
    }
  } catch (error) {
    return false;
  }

  return true;
};

export const createTenant = async (repository: Repository<Tenant>) => {
  const tenant = await repository.save({
    name: 'Tenant name',
    address: 'Tenant address'
  });

  return tenant;
};
export const createUser = async (repository: Repository<User>) => {
  const hashedPassword = await bcrypt.hash('test1234', 10);

  const user = await repository.save({
    firstName: 'Ankit',
    lastName: 'Tripahi',
    email: 'ankit@gmail.com',
    password: hashedPassword,
    role: Roles.CUSTOMER
  });

  return user;
};

export const generateRefreshToken = (payload: JwtPayload) => {
  const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
    algorithm: 'HS256',
    expiresIn: Config.REFRESH_TOKEN_EXPIRES_IN,
    issuer: Config.SERVICE_NAME,
    jwtid: String(payload.id)
  });

  return refreshToken;
};

export const getUsers = async (connection: DataSource) => {
  const userRespository = connection.getRepository(User);
  return await userRespository.find();
};
