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

type TRequestAuth = {
  id?: string;
  sub: string;
  role: string;
};

export interface IAuthRequest extends Request {
  auth: TRequestAuth;
}

export type TAuthCookies = {
  accessToken: string;
  refreshToken: string;
};

export type TRefreshTokenPayload = {
  id: string;
  sub: string;
};

export type TCreateUserRequest = GenericRequest<TUser>;
export type TUpdateUserRequest = GenericRequest<TUser> & {
  auth: TRequestAuth;
};

export const enum Roles {
  CUSTOMER = 'customer',
  MANAGER = 'manager',
  ADMIN = 'admin'
}

export const roles: Roles[] = [Roles.CUSTOMER, Roles.MANAGER, Roles.ADMIN];
