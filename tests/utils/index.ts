import bcrypt from 'bcryptjs';
import { JwtPayload, sign } from 'jsonwebtoken';
import { DataSource, Repository } from 'typeorm';
import { Config } from '../../src/config';
import { RefreshToken, Tenant, User } from '../../src/entity';
import { Roles, TUser } from '../../src/types/auth.types';

export const truncateTables = async (connection: DataSource) => {
  const entities = connection.entityMetadatas;

  for (const entity of entities) {
    const respository = connection.getRepository(entity.name);
    await respository.clear();
  }
};

export const isJwt = (token: string) => {
  if (!token) return false;

  const parts = token.split('.');

  if (parts.length !== 3) return false;

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
    name: 'New tenant name',
    address: 'New tenant name'
  });

  return tenant;
};
export const createUser = async (repository: Repository<User>) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash('test1234', saltRounds);

  const user = await repository.save({
    firstName: 'Ankit',
    lastName: 'Tripahi',
    email: 'ankit@gmail.com',
    password: hashedPassword,
    role: Roles.CUSTOMER
  });

  return user;
};
export const createRefreshToken = async (
  repository: Repository<RefreshToken>,
  user: TUser
) => {
  const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365; // 1 year

  return await repository.save({
    user,
    expiresAt: new Date(Date.now() + MS_IN_YEAR)
  });
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

export const getTenants = async (connection: DataSource) => {
  const tenantRepository = connection.getRepository(Tenant);
  return await tenantRepository.find();
};

export const getRefreshTokens = async (connection: DataSource) => {
  const refreshTokenRepository = connection.getRepository(RefreshToken);
  return await refreshTokenRepository.find();
};
