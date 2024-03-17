import { Request } from 'express';

export type TUser = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Roles;
  tenantId?: string;
};

export interface IRegisterUserRequest extends Request {
  body: TUser;
}

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

export interface ICreateUserRequest extends Request {
  body: TUser;
}
export interface IUpdateUserRequest extends Request {
  body: TUser;
  auth: TRequestAuth;
}

export const enum Roles {
  CUSTOMER = 'customer',
  MANAGER = 'manager',
  ADMIN = 'admin'
}

export const roles: Roles[] = [Roles.CUSTOMER, Roles.MANAGER, Roles.ADMIN];
