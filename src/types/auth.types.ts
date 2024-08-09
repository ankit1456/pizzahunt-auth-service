import { Request } from 'express';
import { TGenericBodyRequest } from '.';

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

export type TRegisterUserRequest = TGenericBodyRequest<TUser>;
export type TLoginUserRequest = TGenericBodyRequest<TCredentials>;

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

export type TCreateUserRequest = TGenericBodyRequest<TUser>;
export type TUpdateUserRequest = TGenericBodyRequest<
  Omit<TUser, 'password'>
> & {
  auth: TRequestAuthPayload;
};

export const enum Roles {
  CUSTOMER = 'customer',
  MANAGER = 'manager',
  ADMIN = 'admin'
}

export const roles: Roles[] = [Roles.CUSTOMER, Roles.MANAGER, Roles.ADMIN];

export const enum AuthRoutes {
  REGISTER = '/register',
  LOGIN = '/login',
  REFRESH = '/refresh',
  SELF = '/self',
  LOGOUT = '/logout'
}
