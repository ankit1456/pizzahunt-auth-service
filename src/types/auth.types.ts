import { Request } from 'express';

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Roles;
  tenantId?: string;
}

export interface IRegisterUserRequest extends Request {
  body: IUser;
}

export interface IAuthRequest extends Request {
  auth: {
    id?: string;
    sub: string;
    role: string;
  };
}

export type TAuthCookies = {
  accessToken: string;
  refreshToken: string;
};

export interface IRefreshTokenPayload {
  id: string;
  sub: string;
}

export interface ICreateUserRequest extends Request {
  body: IUser;
}
export interface IUpdateUserRequest extends Request {
  body: IUser;
  auth: {
    id?: string;
    sub: string;
    role: string;
  };
}

export const enum Roles {
  CUSTOMER = 'customer',
  MANAGER = 'manager',
  ADMIN = 'admin'
}

export const roles = ['customer', 'manager', 'admin'];
