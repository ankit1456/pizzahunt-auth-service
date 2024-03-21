import { Request } from 'express';

export type TUser = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Roles;
  tenantId?: string;
};

type TCredentials = {
  email: string;
  password: string;
};

interface GenericRequest<T> extends Request {
  body: T;
}

export type TRegisterUserRequest = GenericRequest<TUser>;
export type TLoginUserRequest = GenericRequest<TCredentials>;

type TRequestAuthPayload = {
  id?: string;
  sub: string;
  role: string;
};

export type TAuthRequest = Request & {
  auth: TRequestAuthPayload;
};

export type TAuthCookies = {
  accessToken: string;
  refreshToken: string;
};

export type TRefreshTokenPayload = {
  id: string;
  sub: string;
};

export type TCreateUserRequest = GenericRequest<TUser>;
export type TUpdateUserRequest = GenericRequest<Omit<TUser, 'password'>> & {
  auth: TRequestAuthPayload;
};

export const enum Roles {
  CUSTOMER = 'customer',
  MANAGER = 'manager',
  ADMIN = 'admin'
}

export const roles: Roles[] = [Roles.CUSTOMER, Roles.MANAGER, Roles.ADMIN];
